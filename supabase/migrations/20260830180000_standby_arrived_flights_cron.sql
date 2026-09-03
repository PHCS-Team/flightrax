-- Auto-standby: pg_cron runs inside Postgres (available on the free
-- tier — no external workers or deployment needed). Every 30 minutes,
-- flights that arrived at least an hour ago are moved to standby,
-- which removes the aircraft from the dashboard board and the
-- today's-flights drawer. A newly approved request for the same
-- aircraft is unaffected — that is a separate scheduled journey row.

create extension if not exists pg_cron;

select cron.schedule(
  'standby-arrived-flights',
  '*/30 * * * *',
  $$
    update public.flight_journeys
    set status = 'standby'
    where status = 'arrived'
      and terminated_at < now() - interval '1 hour'
  $$
);
