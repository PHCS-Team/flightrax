-- The two aircraft-based reporting functions still labelled their outputs
-- with the pre-rename column names: aircraft_identification (actually the
-- short registration number) and model (actually the registration mark).
-- Those labels now match the columns they return. get_todays_flights is
-- untouched: its aircraft_identification is the flight plan's Item 7 value,
-- which is correctly named.

drop function if exists public.get_dashboard_flight_status(boolean, integer, integer, text);

create function public.get_dashboard_flight_status(
  p_include_on_ground boolean default true,
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
    a.registration_number,
    a.registration_mark,
    a.aircraft_type as type_key,
    t.type as type_name,
    t.icao_designator as type_icao_designator,
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
      and fj.status in ('active', 'arrived')
    order by
      case fj.status when 'active' then 0 else 1 end,
      fj.updated_at desc
    limit 1
  ) j on true
  where a.status <> 'retired'
    and (p_include_on_ground or a.status = 'active')
    and (
      j.journey_id is not null
      or a.status in ('maintenance', 'grounded')
    )
    and (
      p_status_group is null
      or (
        p_status_group = 'on_ground'
        and a.status in ('maintenance', 'grounded')
      )
      or (
        p_status_group = 'active'
        and a.status = 'active'
        and j.journey_status = 'active'
      )
      or (
        p_status_group = 'arrived'
        and a.status = 'active'
        and j.journey_status = 'arrived'
      )
    )
  order by
    case
      when a.status in ('maintenance', 'grounded') then 3
      when j.journey_status = 'active' then 0
      when j.journey_status = 'arrived' then 1
      else 2
    end,
    a.registration_number asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_dashboard_flight_status(boolean, integer, integer, text) to authenticated;
grant execute on function public.get_dashboard_flight_status(boolean, integer, integer, text) to service_role;

drop function if exists public.get_flight_plan_aircraft_options(text, text, integer, integer);

create function public.get_flight_plan_aircraft_options(
  p_search text default null,
  p_type_key text default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns table (
  id uuid,
  registration_number text,
  registration_mark text,
  type_key text,
  type_name text,
  type_icao_designator text,
  color_markings text,
  photo_path text,
  has_wb_config boolean,
  has_type_specs boolean,
  has_active_flight boolean,
  is_available boolean,
  total_count bigint
)
language sql
stable
as $$
  select
    a.id,
    a.registration_number,
    a.registration_mark,
    a.aircraft_type as type_key,
    t.type as type_name,
    t.icao_designator as type_icao_designator,
    a.color_markings,
    a.photo_path,
    (c.aircraft_id is not null) as has_wb_config,
    (
      t.usable_fuel_arm is not null
      and t.fi_and_student_arm is not null
      and t.maximum_takeoff_weight is not null
    ) as has_type_specs,
    exists (
      select 1
      from public.flight_journeys fj
      where fj.aircraft_id = a.id
        and fj.status = 'active'
    ) as has_active_flight,
    (
      c.aircraft_id is not null
      and t.usable_fuel_arm is not null
      and t.fi_and_student_arm is not null
      and t.maximum_takeoff_weight is not null
    ) as is_available,
    count(*) over () as total_count
  from public.aircrafts a
  join public.aircraft_types t on t.type_key = a.aircraft_type
  left join public.aircraft_weight_balance_configs c on c.aircraft_id = a.id
  where a.status = 'active'
    and (
      p_search is null
      or a.registration_number ilike '%' || p_search || '%'
      or a.registration_mark ilike '%' || p_search || '%'
    )
    and (p_type_key is null or a.aircraft_type = p_type_key)
  order by is_available desc, a.registration_number asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_flight_plan_aircraft_options(text, text, integer, integer) to authenticated;
grant execute on function public.get_flight_plan_aircraft_options(text, text, integer, integer) to service_role;
