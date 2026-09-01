-- No-show sweep: a journey still 'scheduled' after its zulu DOF day has
-- passed never commenced — mark it cancelled so the data stays honest
-- (cancelled_by stays null: the system called it, not a person). Runs
-- daily shortly after zulu midnight; pg_cron schedules run in UTC.

select cron.schedule(
  'cancel-no-show-flights',
  '5 0 * * *',
  $$
    update public.flight_journeys
    set
      status = 'cancelled',
      cancelled_at = now()
    where status = 'scheduled'
      and dof_date < (now() at time zone 'utc')::date
  $$
);
