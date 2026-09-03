-- Today's flights list for the dashboard drawer: journeys for the
-- current zulu DOF date (plus any still-active overnight flight) that
-- are scheduled, active, or arrived. Searchable by aircraft
-- identification and departure/destination ICAO code; optionally
-- filtered to one requester (students only see their own requests).

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
  commenced_at timestamptz,
  trainee_name text,
  pilot_in_command_name text,
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
    fj.commenced_at,
    fp.pilot_name as trainee_name,
    fp.pilot_in_command_name,
    count(*) over () as total_count
  from public.flight_journeys fj
  join public.flight_requests fr on fr.id = fj.flight_request_id
  join public.flight_plans fp on fp.id = fr.flight_plan_id
  where fj.status in ('scheduled', 'active', 'arrived')
    and (
      fj.dof_date = (now() at time zone 'utc')::date
      or fj.status = 'active'
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
    fp.departure_time_raw asc,
    fp.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_todays_flights(text, uuid, integer, integer) to authenticated;
grant execute on function public.get_todays_flights(text, uuid, integer, integer) to service_role;
