-- The board's "On Ground" section is the client's definition — aircraft
-- preparing for departure, i.e. today's scheduled flights — not aircraft
-- under maintenance. Maintenance/grounded aircraft leave the board (they
-- are not flights), so p_include_on_ground goes away.
--
-- Sections are now per flight, mirroring the client's three lists:
--   active   → the aircraft's active journey (one per aircraft, DB-enforced)
--   on_ground → the aircraft's EARLIEST scheduled journey for today's zulu
--               DOF (the commence gate only lets that one start first)
--   arrived  → the aircraft's latest arrived journey
-- An aircraft can therefore appear in more than one section (it arrived
-- from one flight and has the next one scheduled). The unsectioned board
-- (p_status_group null) keeps one row per aircraft: active, else the
-- earliest scheduled today, else the latest arrived.
--
-- dof_at is a new OUT column so the client can flag a scheduled flight as
-- overdue once its filed DOF passes without a commence.

drop function if exists public.get_dashboard_flight_status(boolean, integer, integer, text);

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
