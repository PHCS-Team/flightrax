-- Three corrections to the notification events.
--
-- 1. admin_registered is dropped. Admin accounts are not reviewed — the
--    handle_new_user trigger creates admin_profiles directly at signup and
--    no one approves it — so announcing it to superadmins is noise about a
--    decision nobody makes.
--
-- 2. account_approved and account_rejected are dropped from the in-app
--    feed. The recipient cannot reach it: while approval_status is not
--    'approved', canAccessPath confines them to /pending-approval, so there
--    is no dashboard and no bell. The row would sit unread until approval
--    and then surface a stale rejection next to the approval. These belong
--    to push notifications instead (see docs/NOTIFICATIONS-MATRIX.md §5),
--    which reach a signed-out device: approved -> /dashboard,
--    rejected -> /pending-approval.
--
--    The type strings stay in the notifications check constraint so the
--    push phase can reuse them without another schema change.
--
-- 3. instructor_unavailable pointed at /schedule, which renders hardcoded
--    placeholder cards and no instructor data at all. /instructors is where
--    a student actually sees it: instructors-table has a Status column
--    driven by getInstructorAvailabilityStatus(unavailabilities), and
--    students hold INSTRUCTORS_VIEW.

drop trigger if exists admin_profiles_notify on public.admin_profiles;
drop function if exists public.notify_admin_registered();

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

  -- Resubmission first: it sets submitted_at *and* moves approval_status
  -- rejected -> pending, so it would otherwise report as a new submission.
  if old.approval_status = 'rejected' and new.approval_status = 'pending' then
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

create or replace function public.notify_instructor_unavailable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_when text;
begin
  v_name := public.notification_person_name(new.instructor_profile_id);

  v_when := case
    when new.starts_on = new.ends_on
      then format('on %s', to_char(new.starts_on, 'Mon FMDD, YYYY'))
    else format(
      'from %s to %s',
      to_char(new.starts_on, 'Mon FMDD'),
      to_char(new.ends_on, 'Mon FMDD, YYYY')
    )
  end;

  perform public.create_notifications(
    p_user_ids => public.notification_audience_role('student'),
    p_type => 'instructor_unavailable',
    p_title => format(
      '%s is unavailable %s',
      coalesce(v_name, 'An instructor'),
      v_when
    ),
    p_actor_id => new.created_by,
    p_body => 'Plan your flight requests around this period.',
    p_href => '/instructors',
    p_entity_type => 'instructor_unavailability',
    p_entity_id => new.id
  );

  return null;
exception
  when others then
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;
