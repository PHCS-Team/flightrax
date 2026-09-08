-- Public flight monitor (TV board): every active aircraft's current
-- journey in one call — no paging, no viewer — plus the readable
-- destination from the plan's DEST/ line in Other Information. Same
-- selection rules as get_dashboard_flight_status (active, else the
-- earliest on-ground flight today, else the latest arrived). Executable
-- by the service role only; the public API route serves display fields.

create function public.get_flight_monitor_board()
returns table (
  aircraft_id uuid,
  registration_mark text,
  journey_status public.journey_status,
  dof_at timestamptz,
  commenced_at timestamptz,
  terminated_at timestamptz,
  departure_aerodrome text,
  destination_aerodrome text,
  destination_text text,
  total_eet text,
  trainee_name text,
  instructor_name text
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
      fp.total_eet::text as total_eet,
      fp.pilot_name as trainee_name,
      fi.full_name as instructor_name,
      (regexp_match(
        fp.other_remarks,
        '(?:^|\n)[ \t]*DEST/[ \t]*([^\n]+)',
        'i'
      ))[1] as destination_text,
      fp.id as flight_plan_id,
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
          and fj.dof_date = public.operations_today()
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
    a.id as aircraft_id,
    a.registration_mark,
    j.journey_status,
    j.dof_at,
    j.commenced_at,
    j.terminated_at,
    j.departure_aerodrome,
    j.destination_aerodrome,
    j.destination_text,
    j.total_eet,
    j.trainee_name,
    j.instructor_name
  from per_status j
  join public.aircrafts a on a.id = j.aircraft_id
  where a.status = 'active'
    and j.rank_overall = 1
  order by
    j.priority,
    j.dof_at asc nulls last,
    j.terminated_at desc nulls last,
    a.registration_number asc
$$;

revoke all on function public.get_flight_monitor_board() from public;
grant execute on function public.get_flight_monitor_board() to service_role;
