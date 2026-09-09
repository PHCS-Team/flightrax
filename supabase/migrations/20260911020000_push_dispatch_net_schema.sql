-- Fix the schema qualification on the push dispatch call.
--
-- 20260911010000 called extensions.net.http_post(). pg_net creates its own
-- `net` schema regardless of the schema given to CREATE EXTENSION, so the
-- correct name is net.http_post(). Verified against the database:
--   select n.nspname, p.proname from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace where p.proname='http_post';
--   -> net | http_post
--
-- This was silent rather than loud: a plpgsql body is not resolved at
-- creation time, so the bad name only failed at runtime, where the trigger's
-- own exception handler swallowed it. Every notification would have been
-- created normally with no push and no error.

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

  -- Argument names match the installed signature: url, body, params,
  -- headers, timeout_milliseconds.
  perform net.http_post(
    url := v_config.url,
    body := jsonb_build_object('notificationId', new.id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-dispatch-secret', v_config.secret
    ),
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
