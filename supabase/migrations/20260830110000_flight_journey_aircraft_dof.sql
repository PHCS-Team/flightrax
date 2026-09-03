-- Denormalize the aircraft and the zulu DOF date onto flight journeys
-- so "one live journey (scheduled or active) per aircraft per DOF date"
-- is enforced by the database itself. The approve action writes both on
-- journey creation; the partial unique index makes the rule race-proof
-- (two simultaneous approvals cannot double-book an aircraft), and the
-- plain index keeps the dashboard's latest-journey lookup cheap.

alter table public.flight_journeys
  add column aircraft_id uuid references public.aircrafts(id) on delete set null,
  add column dof_date date;

update public.flight_journeys fj
set
  aircraft_id = fp.aircraft_id,
  dof_date = (fp.dof_resolved at time zone 'utc')::date
from public.flight_requests fr
join public.flight_plans fp on fp.id = fr.flight_plan_id
where fr.id = fj.flight_request_id;

create unique index flight_journeys_live_per_aircraft_dof_idx
  on public.flight_journeys (aircraft_id, dof_date)
  where status in ('scheduled', 'active');

create index flight_journeys_aircraft_dof_idx
  on public.flight_journeys (aircraft_id, dof_date);
