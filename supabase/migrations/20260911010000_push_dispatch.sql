-- Hand every new notification to the push sender.
--
-- The in-app feed and push must never diverge, so this hangs off the same
-- row insert the bell already reads rather than duplicating the recipient
-- rules. create_notifications() stays the single choke point: Rules A and D
-- are applied before the row exists, so anything reaching this trigger is
-- already a legitimate recipient.
--
-- pg_net is used rather than a synchronous HTTP call because net.http_post
-- queues the request and returns immediately. A slow or unreachable sender
-- must never hold open the transaction that created the notification —
-- which, for account_requests, is the auth signup transaction.

create extension if not exists pg_net with schema extensions;

-- Endpoint and shared secret live here rather than in the migration so the
-- same schema works across environments. Locked down to the service role;
-- the trigger reads it as a security definer.
create table if not exists private.push_dispatch_config (
  id boolean primary key default true,
  url text not null,
  secret text not null,
  constraint push_dispatch_config_single_row check (id)
);

alter table private.push_dispatch_config enable row level security;
revoke all on private.push_dispatch_config from anon, authenticated;

create or replace function public.dispatch_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config private.push_dispatch_config%rowtype;
begin
  select * into v_config from private.push_dispatch_config limit 1;

  -- Push is optional. Until the row is configured the app still works and
  -- the in-app feed is unaffected.
  if v_config.url is null then
    return null;
  end if;

  perform extensions.net.http_post(
    url := v_config.url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-dispatch-secret', v_config.secret
    ),
    body := jsonb_build_object('notificationId', new.id),
    timeout_milliseconds := 5000
  );

  return null;
exception
  when others then
    -- Same contract as the notification triggers: a delivery problem must
    -- never roll back the operation that caused it.
    raise warning 'push dispatch skipped for notification %: %', new.id, sqlerrm;

    return null;
end;
$$;

create trigger notifications_dispatch_push
  after insert on public.notifications
  for each row execute function public.dispatch_notification_push();
