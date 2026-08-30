-- The board monitors activity, not idle inventory: only aircraft with a
-- journey for the current zulu day (or one still active from a prior
-- date) appear, plus maintenance/grounded aircraft so their
-- unavailability stays visible. Standby aircraft — active status, no
-- flight today — are excluded.

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
      and fj.status <> 'cancelled'
      and (
        fj.dof_date = (now() at time zone 'utc')::date
        or fj.status = 'active'
      )
    order by
      case fj.status
        when 'active' then 0
        when 'scheduled' then 1
        when 'arrived' then 2
        else 3
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
      when j.journey_status in ('arrived', 'terminated') then 2
      else 3
    end,
    a.aircraft_identification asc
  limit p_page_size
  offset (p_page - 1) * p_page_size
$$;

grant execute on function public.get_dashboard_flight_status(boolean, integer, integer) to authenticated;
grant execute on function public.get_dashboard_flight_status(boolean, integer, integer) to service_role;
