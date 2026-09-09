-- The no-show sweep compared a Manila date against a UTC date.
--
-- flight_journeys.dof_date is the operations day —
-- operations_date(ts) = (ts at time zone 'Asia/Manila')::date, kept by a
-- trigger since 20260905000000 — but the cron, written before that, tested
-- it against (now() at time zone 'utc')::date.
--
-- It has been right only by coincidence of scheduling: at 00:05 UTC it is
-- 08:05 Manila on the same calendar date, so the two agree. They diverge
-- between 16:00 and 24:00 UTC, once Manila has rolled over. Move the cron
-- and it would silently cancel flights a day early or late — and since
-- 20260910020000 that also means sending every participant a wrong
-- "automatically cancelled" notification.
--
-- Comparing against operations_today() states the intent instead of
-- depending on the hour the job happens to run. The schedule and the
-- command are otherwise unchanged; cancelled_by stays null, which is what
-- marks this as a system cancellation rather than a person's.

select cron.unschedule('cancel-no-show-flights')
where exists (
  select 1 from cron.job where jobname = 'cancel-no-show-flights'
);

select cron.schedule(
  'cancel-no-show-flights',
  '5 0 * * *',
  $$
    update public.flight_journeys
    set
      status = 'cancelled',
      cancelled_at = now()
    where status = 'scheduled'
      and dof_date < public.operations_today()
  $$
);
