-- An overnight flight that lands after zulu midnight carries
-- yesterday's DOF, so its Arrived state vanished from the board and
-- drawer the moment it was terminated. Arrived journeys now surface
-- regardless of DOF date — safe because the standby cron sweeps any
-- arrived journey about an hour after landing.

create or replace function public.get_dashboard_flight_status(
  p_include_on_ground boolean default true,
  p_page integer default 1,
  p_page_size integer default 10
)
returns table (
  id uuid,
  aircraft_identification text,
  model text,
  type_key text,
  type_name text,
  photo_path text,
  aircraft_status public.aircraft_status,
  journey_id uuid,
  journey_status public.journey_status,
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
  select
    a.id,
    a.aircraft_identification,
    a.model,
    a.aircraft_type as type_key,
    t.type as type_name,
    a.photo_path,
    a.status as aircraft_status,
    j.journey_id,
    j.journey_status,
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
  from public.aircrafts a
  join public.aircraft_types t on t.type_key = a.aircraft_type
  left join lateral (
    select
      fj.id as journey_id,
      fj.status as journey_status,
      fj.commenced_at,
      fj.terminated_at,
      fp.departure_aerodrome,
      fp.destination_aerodrome,
      fp.departure_time_raw,
      fp.cruising_speed,
      fp.cruising_level,
      fp.total_eet::text as total_eet,
      fp.pilot_name as trainee_name,
      fp.pilot_in_command_name
    from public.flight_journeys fj
    join public.flight_requests fr on fr.id = fj.flight_request_id
    join public.flight_plans fp on fp.id = fr.flight_plan_id
    where fj.aircraft_id = a.id
      and fj.status in ('scheduled', 'active', 'arrived')
      and (
        fj.dof_date = (now() at time zone 'utc')::date
        or fj.status in ('active', 'arrived')
      )
    order by
      case fj.status
        when 'active' then 0
        when 'scheduled' then 1
        else 2
      end,
      fj.updated_at desc
    limit 1
  ) j on true
  where a.status <> 'retired'
    and (p_include_on_ground or a.status = 'active')
    and (
      j.journey_id is not null
      or a.status in ('maintenance', 'grounded')
    )
  order by
    case
      when a.status in ('maintenance', 'grounded') then 4
      when j.journey_status = 'active' then 0
      when j.journey_status = 'scheduled' then 1
      when j.journey_status = 'arrived' then 2
      else 3
    end,
    a.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_dashboard_flight_status(boolean, integer, integer) to authenticated;
grant execute on function public.get_dashboard_flight_status(boolean, integer, integer) to service_role;

create or replace function public.get_todays_flights(
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
    fp.departure_time_raw asc,
    fp.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_todays_flights(text, uuid, integer, integer) to authenticated;
grant execute on function public.get_todays_flights(text, uuid, integer, integer) to service_role;
