-- Web Push endpoints, one row per browser/device a user has enabled.
--
-- A subscription is issued by the browser's push service (Google, Apple,
-- Mozilla) and is opaque to us: endpoint is the URL to POST to, and p256dh
-- and auth are the keys the payload is encrypted with. They are per-device,
-- so one user legitimately has several — phone, tablet, desktop.
--
-- endpoint is unique because the browser hands back the same endpoint when
-- an existing subscription is re-read, so re-enabling must update the row
-- rather than accumulate duplicates.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  -- Purely diagnostic: which device is this, when a user asks why one of
  -- them stopped receiving notifications.
  user_agent text,
  created_at timestamptz not null default now(),
  -- Refreshed whenever the client re-registers, so a stale row can be told
  -- apart from a live one during cleanup.
  last_seen_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Users may see and remove their own devices. Inserts and updates go
-- through the server (service role), which is what stamps user_id, so there
-- is deliberately no insert policy: a client cannot register a subscription
-- against someone else's account.
create policy "Users can read their own push subscriptions"
  on public.push_subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own push subscriptions"
  on public.push_subscriptions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, delete on public.push_subscriptions to authenticated;
