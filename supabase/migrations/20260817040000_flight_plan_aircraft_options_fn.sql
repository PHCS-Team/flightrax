-- One-query aircraft picker for flight plan filing. Only active aircraft
-- are returned (retired / maintenance / grounded are excluded at the
-- source). Availability — W&B config present, type specs configured, and
-- not currently on an active flight — is computed and ordered in SQL so
-- pagination, query-level search, and type filtering stay correct and
-- cheap even with hundreds of aircraft.

create or replace function public.get_flight_plan_aircraft_options(
  p_search text default null,
  p_type_key text default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns table (
  id uuid,
  aircraft_identification text,
  model text,
  type_key text,
  type_name text,
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
    a.aircraft_identification,
    a.model,
    a.aircraft_type as type_key,
    t.type as type_name,
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
      join public.flight_requests fr on fr.id = fj.flight_request_id
      join public.flight_plans fp on fp.id = fr.flight_plan_id
      where fp.aircraft_id = a.id
        and fj.status = 'active'
    ) as has_active_flight,
    (
      c.aircraft_id is not null
      and t.usable_fuel_arm is not null
      and t.fi_and_student_arm is not null
      and t.maximum_takeoff_weight is not null
      and not exists (
        select 1
        from public.flight_journeys fj
        join public.flight_requests fr on fr.id = fj.flight_request_id
        join public.flight_plans fp on fp.id = fr.flight_plan_id
        where fp.aircraft_id = a.id
          and fj.status = 'active'
      )
    ) as is_available,
    count(*) over () as total_count
  from public.aircrafts a
  join public.aircraft_types t on t.type_key = a.aircraft_type
  left join public.aircraft_weight_balance_configs c on c.aircraft_id = a.id
  where a.status = 'active'
    and (
      p_search is null
      or a.aircraft_identification ilike '%' || p_search || '%'
      or a.model ilike '%' || p_search || '%'
    )
    and (p_type_key is null or a.aircraft_type = p_type_key)
  order by is_available desc, a.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_flight_plan_aircraft_options(text, text, integer, integer) to authenticated;
grant execute on function public.get_flight_plan_aircraft_options(text, text, integer, integer) to service_role;
