-- In-app notifications. See docs/NOTIFICATIONS-MATRIX.md for the recipient
-- matrix and the four rules this schema enforces.
--
-- One row per recipient per event. Fanning out rows (rather than one row
-- plus a recipients join table) is what makes the per-user realtime filter
-- possible, and at this scale the row count is trivial.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Null when the event came from a cron rather than a person; the message
  -- then uses the passive voice (Rule B).
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in (
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
    'instructor_unavailable'
  )),
  -- Composed at insert time, per recipient (Rule B). Stored finished so the
  -- push sender can use the same string without re-deriving it.
  title text not null,
  body text,
  -- Deep link for "view and redirect"; null for notifications with nowhere
  -- to go.
  href text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- The notification list: newest first, scoped to one user.
create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- The unread badge count. Partial so it stays small as read rows accumulate.
create index notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can mark their own notifications read"
  on public.notifications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Column-level update grant: a user may set read_at on their own rows and
-- nothing else. Without this, the update policy above would also let them
-- rewrite the title and body of their own notifications.
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- No insert policy and no insert grant. Rows are only ever written by
-- create_notifications() below, which is security definer, so every
-- notification in the system passes through the one choke point that
-- applies Rules A and D.
create function public.create_notifications(
  p_user_ids uuid[],
  p_type text,
  p_title text,
  p_actor_id uuid default null,
  p_body text default null,
  p_href text default null,
  p_entity_type text default null,
  p_entity_id uuid default null
)
returns integer
language sql
security definer
set search_path = public
as $$
  with inserted as (
    insert into public.notifications (
      user_id, actor_id, type, title, body, href, entity_type, entity_id
    )
    -- Rule D: the recipient list is a set, so distinct collapses a person
    -- who qualifies through more than one audience (a trainee who is also
    -- the pilot in command, say) into a single row.
    -- Rule A: the actor is removed after dedup, never notified of their
    -- own action.
    select distinct
      candidate, p_actor_id, p_type, p_title, p_body, p_href,
      p_entity_type, p_entity_id
    from unnest(p_user_ids) as candidate
    where candidate is not null
      and (p_actor_id is null or candidate <> p_actor_id)
    returning 1
  )
  select count(*)::integer from inserted;
$$;

revoke all on function public.create_notifications(
  uuid[], text, text, uuid, text, text, text, uuid
) from public;

-- Realtime (Rule 19 budget).
--
-- Justification: a notification is by definition another user's action that
-- must reach you without a refresh, which is exactly what realtime is for.
--
-- Cost: subscribers filter on user_id=eq.<uid>, so one inserted row is one
-- delivery to one client rather than a fan-out every other client discards.
-- At ~500 notification rows/day that is ~15k messages/month against the 2M
-- free-tier quota. Connections do not increase: the browser client is a
-- singleton, so this channel shares the socket a session already holds.
--
-- Delivery follows the select policy above (own rows only), so a client
-- cannot receive another user's notification even without the filter.
alter publication supabase_realtime add table public.notifications;
