-- Every flight carries one assigned flight instructor, even when a
-- PPL-holding student is the pilot in command. The instructor is an
-- operational assignment, not a CAAP form field, so it lives on the
-- request (which exists from filing, before any journey) rather than on
-- the plan snapshot. The boards and the review queue read it from here.
--
-- Nullable at the database level for existing rows; the app requires it
-- on every create and update. Existing rows are backfilled from the PIC
-- where the PIC is an instructor.

alter table public.flight_requests
  add column instructor_profile_id uuid references public.profiles(id);

create index flight_requests_instructor_profile_id_idx
  on public.flight_requests (instructor_profile_id);

update public.flight_requests fr
set instructor_profile_id = fp.pilot_in_command_id
from public.flight_plans fp
join public.profiles p on p.id = fp.pilot_in_command_id
where fp.id = fr.flight_plan_id
  and fr.instructor_profile_id is null
  and p.role in ('instructor', 'superadmin');

-- Board: instructor_name replaces the PIC as the "Instructor" column
-- source. New OUT column → drop and re-create (body from 20260904090000).
drop function if exists public.get_dashboard_flight_status(integer, integer, text);

create function public.get_dashboard_flight_status(
  p_page integer default 1,
  p_page_size integer default 10,
  p_status_group text default null
)
returns table (
  id uuid,
  registration_number text,
  registration_mark text,
  type_key text,
  type_name text,
  type_icao_designator text,
  photo_path text,
  journey_id uuid,
  journey_status public.journey_status,
  dof_at timestamptz,
  commenced_at timestamptz,
  terminated_at timestamptz,
  departure_aerodrome text,
  destination_aerodrome text,
  departure_time_raw text,
  cruising_speed text,
  cruising_level text,
  total_eet text,
  trainee_name text,
  pilot_in_command_name text,
  instructor_name text,
  total_count bigint
)
language sql
stable
as $$
  with candidates as (
    select
      fj.id as journey_id,
      fj.aircraft_id,
      fj.status as journey_status,
      fj.dof_at,
      fj.commenced_at,
      fj.terminated_at,
      fp.departure_aerodrome,
      fp.destination_aerodrome,
      fp.departure_time_raw,
      fp.cruising_speed,
      fp.cruising_level,
      fp.total_eet::text as total_eet,
      fp.pilot_name as trainee_name,
      fp.pilot_in_command_name,
      fi.full_name as instructor_name,
      case fj.status
        when 'active' then 0
        when 'scheduled' then 1
        else 2
      end as priority,
      row_number() over (
        partition by fj.aircraft_id, fj.status
        order by
          case when fj.status = 'scheduled' then fj.dof_at end asc nulls last,
          fj.terminated_at desc nulls last,
          fj.updated_at desc
      ) as rank_in_status
    from public.flight_journeys fj
    join public.flight_requests fr on fr.id = fj.flight_request_id
    join public.flight_plans fp on fp.id = fr.flight_plan_id
    left join public.profiles fi on fi.id = fr.instructor_profile_id
    where fj.aircraft_id is not null
      and (
        fj.status in ('active', 'arrived')
        or (
          fj.status = 'scheduled'
          and fj.dof_date = (now() at time zone 'utc')::date
        )
      )
  ),
  per_status as (
    select
      c.*,
      row_number() over (
        partition by c.aircraft_id
        order by c.priority
      ) as rank_overall
    from candidates c
    where c.rank_in_status = 1
  )
  select
    a.id,
    a.registration_number,
    a.registration_mark,
    a.aircraft_type as type_key,
    t.type as type_name,
    t.icao_designator as type_icao_designator,
    a.photo_path,
    j.journey_id,
    j.journey_status,
    j.dof_at,
    j.commenced_at,
    j.terminated_at,
    j.departure_aerodrome,
    j.destination_aerodrome,
    j.departure_time_raw,
    j.cruising_speed,
    j.cruising_level,
    j.total_eet,
    j.trainee_name,
    j.pilot_in_command_name,
    j.instructor_name,
    count(*) over () as total_count
  from per_status j
  join public.aircrafts a on a.id = j.aircraft_id
  join public.aircraft_types t on t.type_key = a.aircraft_type
  where a.status = 'active'
    and (
      (p_status_group is null and j.rank_overall = 1)
      or (p_status_group = 'active' and j.journey_status = 'active')
      or (p_status_group = 'on_ground' and j.journey_status = 'scheduled')
      or (p_status_group = 'arrived' and j.journey_status = 'arrived')
    )
  order by
    j.priority,
    j.dof_at asc nulls last,
    j.terminated_at desc nulls last,
    a.registration_number asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_dashboard_flight_status(integer, integer, text) to authenticated;
grant execute on function public.get_dashboard_flight_status(integer, integer, text) to service_role;

-- Drawer: same addition (body from 20260902000000).
drop function if exists public.get_todays_flights(text, uuid, integer, integer);

create function public.get_todays_flights(
  p_search text default null,
  p_requested_by uuid default null,
  p_page integer default 1,
  p_page_size integer default 5
)
returns table (
  journey_id uuid,
  journey_status public.journey_status,
  flight_request_id uuid,
  flight_plan_id uuid,
  requested_by uuid,
  aircraft_identification text,
  departure_aerodrome text,
  destination_aerodrome text,
  departure_time_raw text,
  dof_at timestamptz,
  commenced_at timestamptz,
  trainee_name text,
  pilot_in_command_name text,
  instructor_name text,
  total_count bigint
)
language sql
stable
as $$
  select
    fj.id as journey_id,
    fj.status as journey_status,
    fr.id as flight_request_id,
    fp.id as flight_plan_id,
    fr.requested_by,
    fp.aircraft_identification,
    fp.departure_aerodrome,
    fp.destination_aerodrome,
    fp.departure_time_raw,
    fj.dof_at,
    fj.commenced_at,
    fp.pilot_name as trainee_name,
    fp.pilot_in_command_name,
    fi.full_name as instructor_name,
    count(*) over () as total_count
  from public.flight_journeys fj
  join public.flight_requests fr on fr.id = fj.flight_request_id
  join public.flight_plans fp on fp.id = fr.flight_plan_id
  left join public.profiles fi on fi.id = fr.instructor_profile_id
  where fj.status in ('scheduled', 'active', 'arrived')
    and (
      fj.dof_date = (now() at time zone 'utc')::date
      or fj.status in ('active', 'arrived')
    )
    and (p_requested_by is null or fr.requested_by = p_requested_by)
    and (
      p_search is null
      or fp.aircraft_identification ilike '%' || p_search || '%'
      or fp.departure_aerodrome ilike '%' || p_search || '%'
      or fp.destination_aerodrome ilike '%' || p_search || '%'
    )
  order by
    case fj.status
      when 'active' then 0
      when 'scheduled' then 1
      else 2
    end,
    fj.dof_at asc nulls last,
    fp.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_todays_flights(text, uuid, integer, integer) to authenticated;
grant execute on function public.get_todays_flights(text, uuid, integer, integer) to service_role;
