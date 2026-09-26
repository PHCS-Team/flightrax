-- Today's flights drawer: instructors no longer see every flight. The
-- requested-by filter becomes a participant filter — a flight is shown
-- when the viewer filed it, is its pilot in command, or is its assigned
-- instructor. Only superadmins query without the filter.

drop function if exists public.get_todays_flights(text, uuid, integer, integer);

create function public.get_todays_flights(
  p_search text default null,
  p_participant uuid default null,
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
      fj.dof_date = public.operations_today()
      or fj.status in ('active', 'arrived')
    )
    and (
      p_participant is null
      or fr.requested_by = p_participant
      or fp.pilot_in_command_id = p_participant
      or fr.instructor_profile_id = p_participant
    )
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
