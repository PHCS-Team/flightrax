-- The journey_status enum's on_ground value was never written by any
-- flow and collides with the dashboard's "On Ground" label, which is
-- derived from aircrafts.status (maintenance/grounded) — a single
-- source of truth. Remove the value so journey state stays unambiguous.
-- Postgres cannot drop an enum value in place, so the type is swapped.

update public.flight_journeys
set status = 'scheduled'
where status = 'on_ground';

create type public.journey_status_new as enum (
  'scheduled',
  'active',
  'arrived',
  'terminated',
  'cancelled'
);

alter table public.flight_journeys
  alter column status drop default;

alter table public.flight_journeys
  alter column status type public.journey_status_new
  using status::text::public.journey_status_new;

drop type public.journey_status;

alter type public.journey_status_new rename to journey_status;

alter table public.flight_journeys
  alter column status set default 'scheduled';
