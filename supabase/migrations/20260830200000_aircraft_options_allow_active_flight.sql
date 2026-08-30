-- Filing a flight plan is drafting — an aircraft being on an active
-- flight must not block selecting it. The conflict rules apply at
-- submit (no active flight on the aircraft) and at approval (one live
-- journey per aircraft per DOF date), never at creation. Availability
-- in the picker now only reflects real filing blockers: missing W&B
-- configuration or type specs. has_active_flight stays in the result
-- for informational use.

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
