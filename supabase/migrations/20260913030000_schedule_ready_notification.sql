-- "Schedule ready" — the one schedule notification, sent on purpose.
--
-- Entries are never announced one by one: the admin is usually still
-- editing, and a stream of "entry added" would be noise. Instead the admin
-- pins the finished board up with a single ping, the way the paper board
-- goes on the wall. Re-pinging is allowed (plans change); the UI shows when
-- the last one went out so it is a decision, not an accident.

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
    'flight_no_show',
    'notam_posted',
    'aircraft_status_changed',
    'instructor_unavailable',
    'schedule_ready'
  ));

-- One row per ping, so the board can say "sent 10:32 AM by Juan" and an
-- admin knows whether they are about to notify everyone a second time.
create table public.schedule_pings (
  id uuid primary key default gen_random_uuid(),
  board_date date not null,
  sent_by uuid not null references public.profiles(id),
  sent_at timestamptz not null default now()
);

create index schedule_pings_board_date_idx
  on public.schedule_pings (board_date, sent_at desc);

alter table public.schedule_pings enable row level security;

create policy "Authenticated users can read schedule pings"
  on public.schedule_pings
  for select
  to authenticated
  using (true);

grant select on public.schedule_pings to authenticated;

-- Called from pingScheduleReadyAction through the service role. Audience is
-- everyone who can open /schedule: every approved student and instructor,
-- every admin, superadmin. create_notifications() drops the actor (Rule A)
-- and dedups (Rule D); the existing insert trigger fans out to push.
create function public.notify_schedule_ready(p_date date, p_actor_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ping_id uuid;
  v_sent integer;
begin
  insert into public.schedule_pings (board_date, sent_by)
  values (p_date, p_actor_id)
  returning id into v_ping_id;

  select public.create_notifications(
    p_user_ids => public.notification_audience_everyone(),
    p_type => 'schedule_ready',
    p_title => format(
      'Flight schedule for %s is ready',
      to_char(p_date, 'Dy, Mon FMDD')
    ),
    p_actor_id => p_actor_id,
    p_body => format(
      '%s posted the board. Open it and file your flight request.',
      public.notification_person_name(p_actor_id)
    ),
    p_href => '/schedule?date=' || to_char(p_date, 'YYYY-MM-DD'),
    p_entity_type => 'schedule_ping',
    p_entity_id => v_ping_id
  ) into v_sent;

  return v_sent;
end;
$$;

revoke all on function public.notify_schedule_ready(date, uuid) from public;
revoke all on function public.notify_schedule_ready(date, uuid) from anon, authenticated;
