-- aircrafts.model never held a model — it held the full registration
-- mark (RP-C1884) — and aircrafts.aircraft_identification held only the
-- registration sequence (1884). Name them for what they are. The two
-- reporting functions select these columns by name, so they are
-- re-created; their OUTPUT column names are unchanged (aircraft_identification
-- = the short registration number the tower uses, model = the full mark)
-- so the app's RPC readers keep working.

alter table public.aircrafts
  rename column model to registration_mark;

alter table public.aircrafts
  rename column aircraft_identification to registration_number;

alter table public.aircrafts
  rename constraint aircrafts_model_not_blank to aircrafts_registration_mark_not_blank;

alter table public.aircrafts
  rename constraint aircrafts_aircraft_identification_not_blank
    to aircrafts_registration_number_not_blank;

-- Flight plan aircraft picker (body from 20260830200000, columns renamed).
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
    a.registration_number as aircraft_identification,
    a.registration_mark as model,
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
      or a.registration_number ilike '%' || p_search || '%'
      or a.registration_mark ilike '%' || p_search || '%'
    )
    and (p_type_key is null or a.aircraft_type = p_type_key)
  order by is_available desc, a.registration_number asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

-- Dashboard board (body from 20260902010000, columns renamed).
create or replace function public.get_dashboard_flight_status(
  p_include_on_ground boolean default true,
  p_page integer default 1,
  p_page_size integer default 10,
  p_status_group text default null
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
    a.registration_number as aircraft_identification,
    a.registration_mark as model,
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
