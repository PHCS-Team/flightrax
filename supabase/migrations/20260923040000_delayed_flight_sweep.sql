-- A flight left on ground blocks the aircraft: the commence guard refuses a
-- later flight while an earlier one on the same aircraft is still scheduled,
-- so a no-show at 10:00 kept the 13:00 booking waiting until an instructor
-- cancelled it by hand, or until the next morning's sweep.
--
-- The sweep now runs every 15 minutes against the planned departure:
--   60 minutes late  -> warn the participants once
--   90 minutes late  -> cancel, releasing the aircraft
--
-- Journeys without a dof_at (filed before 20260902000000) keep the old
-- date-based rule as a fallback.

alter table public.flight_journeys
  add column delay_warned_at timestamptz;

comment on column public.flight_journeys.delay_warned_at is
  'When the participants were warned the flight is late; keeps the warning to once per journey.';

alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (type in (
    'account_approved',
    'account_rejected',
    'account_submitted',
    'account_resubmitted',
    'admin_registered',
    'flight_request_submitted',
    'flight_request_approved',
    'flight_request_rejected',
    'flight_request_withdrawn',
    'flight_commenced',
    'flight_arrived',
    'flight_cancelled',
    'flight_delayed',
    'flight_no_show',
    'notam_posted',
    'aircraft_status_changed',
    'instructor_unavailable',
    'schedule_ready',
    'schedule_file_uploaded'
  ));

-- Warning notification, fired when the sweep stamps delay_warned_at.
create function public.notify_flight_delay_warning()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_plan_id uuid;
  v_registration text;
begin
  if new.delay_warned_at is null or old.delay_warned_at is not null then
    return null;
  end if;

  select fr.flight_plan_id, fp.aircraft_identification
    into v_plan_id, v_registration
  from public.flight_requests fr
  join public.flight_plans fp on fp.id = fr.flight_plan_id
  where fr.id = new.flight_request_id;

  perform public.create_notifications(
    p_user_ids => public.notification_audience_participants(new.flight_request_id),
    p_type => 'flight_delayed',
    p_title => format('%s is running late', v_registration),
    p_body => format(
      'Flight %s is an hour past its departure time. It will be cancelled automatically in 30 minutes unless it is commenced.',
      public.notification_flight_label(v_plan_id)
    ),
    p_href => '/dashboard',
    p_entity_type => 'flight_journey',
    p_entity_id => new.id
  );

  return null;
end;
$$;

revoke execute on function public.notify_flight_delay_warning() from public;
revoke execute on function public.notify_flight_delay_warning() from anon;
revoke execute on function public.notify_flight_delay_warning() from authenticated;

create trigger flight_journeys_notify_delay_warning
  after update of delay_warned_at on public.flight_journeys
  for each row execute function public.notify_flight_delay_warning();

-- Replace the daily no-show sweep with the 15-minute grace-period sweep.
select cron.unschedule('cancel-no-show-flights')
where exists (
  select 1 from cron.job where jobname = 'cancel-no-show-flights'
);

select cron.unschedule('sweep-delayed-flights')
where exists (
  select 1 from cron.job where jobname = 'sweep-delayed-flights'
);

select cron.schedule(
  'sweep-delayed-flights',
  '*/15 * * * *',
  $$
    update public.flight_journeys
    set delay_warned_at = now()
    where status = 'scheduled'
      and delay_warned_at is null
      and dof_at is not null
      and dof_at <= now() - interval '60 minutes'
      and dof_at > now() - interval '90 minutes';

    update public.flight_journeys
    set
      status = 'cancelled',
      cancelled_at = now()
    where status = 'scheduled'
      and (
        (dof_at is not null and dof_at <= now() - interval '90 minutes')
        or (dof_at is null and dof_date < public.operations_today())
      );
  $$
);
