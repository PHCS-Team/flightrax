-- Restore account_approved and account_rejected, for push.
--
-- 20260910040000 dropped both because their recipient cannot reach the
-- in-app feed: while approval_status is not 'approved', canAccessPath
-- confines the user to /pending-approval, so there is no bell to read. That
-- reasoning still holds for in-app, and is exactly why these belong to push
-- — a push reaches the device whether or not the app can be opened.
--
-- A notifications row is what the dispatch trigger fires on, so the row has
-- to exist for the push to be sent. The row is a side effect here, not the
-- point.
--
-- Destinations are as specified: approved -> /dashboard (now reachable),
-- rejected -> /pending-approval (where the reason and the resubmission form
-- already are).
--
-- Pending users can now register a device: save_push_subscription no longer
-- requires an approved profile.

create or replace function public.notify_account_request_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select p.full_name into v_name
  from public.profiles p where p.id = new.profile_id;

  if new.approval_status = 'approved'
     and old.approval_status is distinct from 'approved' then
    -- A rejection they were pushed about earlier is now history. Clearing it
    -- stops a stale "your account was rejected" greeting them in the bell the
    -- first time they can actually open it.
    update public.notifications
    set read_at = now()
    where user_id = new.profile_id
      and type = 'account_rejected'
      and read_at is null;

    perform public.create_notifications(
      p_user_ids => array[new.profile_id],
      p_type => 'account_approved',
      p_title => 'Your account has been approved',
      p_actor_id => new.approved_by,
      p_body => 'You can now sign in to FlightraX.',
      p_href => '/dashboard',
      p_entity_type => 'account_request',
      p_entity_id => new.profile_id
    );

  elsif new.approval_status = 'rejected'
        and old.approval_status is distinct from 'rejected' then
    perform public.create_notifications(
      p_user_ids => array[new.profile_id],
      p_type => 'account_rejected',
      p_title => 'Your account was rejected',
      p_actor_id => new.rejected_by,
      p_body => coalesce(
        new.rejection_reason,
        'Open FlightraX to see the reason and resubmit.'
      ),
      p_href => '/pending-approval',
      p_entity_type => 'account_request',
      p_entity_id => new.profile_id
    );

  -- Resubmission first among the remaining cases: it sets submitted_at *and*
  -- moves approval_status rejected -> pending, so it would otherwise report
  -- as a new submission.
  elsif old.approval_status = 'rejected' and new.approval_status = 'pending' then
    perform public.create_notifications(
      p_user_ids => public.notification_audience_department('flight_operations_personnel'),
      p_type => 'account_resubmitted',
      p_title => format('%s resubmitted their account', coalesce(v_name, 'A user')),
      p_actor_id => new.profile_id,
      p_body => 'Awaiting account review.',
      p_href => '/account-review',
      p_entity_type => 'account_request',
      p_entity_id => new.profile_id
    );

  elsif old.submitted_at is null and new.submitted_at is not null then
    -- The row is created by handle_new_user at auth signup, before any ID
    -- number or document exists, so submitted_at being stamped is the real
    -- submission.
    perform public.create_notifications(
      p_user_ids => public.notification_audience_department('flight_operations_personnel'),
      p_type => 'account_submitted',
      p_title => format(
        '%s registered as %s',
        coalesce(v_name, 'A new user'),
        case new.request_type
          when 'instructor' then 'an instructor'
          else 'a student'
        end
      ),
      p_actor_id => new.profile_id,
      p_body => 'Awaiting account review.',
      p_href => '/account-review',
      p_entity_type => 'account_request',
      p_entity_id => new.profile_id
    );
  end if;

  return null;
exception
  when others then
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;
