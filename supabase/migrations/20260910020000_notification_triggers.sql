-- Emits the 16 notification events in docs/NOTIFICATIONS-MATRIX.md §3.
--
-- Why triggers rather than server actions: every write in this app goes
-- through the service-role admin client, and some notification-worthy
-- changes have no action at all (the no-show cron). A trigger on the row
-- that changed is the one choke point every path passes through, and it can
-- join for the aircraft registration and plan code that the actions do not
-- select.
--
-- The actor is read from the row (approved_by, rejected_by, commenced_by,
-- terminated_by, cancelled_by, created_by) rather than auth.uid(), which is
-- null under the service role. create_notifications() then drops the actor
-- (Rule A) and dedups (Rule D).

-- ---------------------------------------------------------------- accounts

create function public.notify_account_request_changes()
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

  -- Ordering matters. A resubmission sets submitted_at *and* moves
  -- approval_status rejected -> pending, so the resubmission case has to be
  -- tested before the first-submission case or it would report as new.
  if new.approval_status = 'approved'
     and old.approval_status is distinct from 'approved' then
    perform public.create_notifications(
      p_user_ids => array[new.profile_id],
      p_type => 'account_approved',
      p_title => 'Your account has been approved',
      p_actor_id => new.approved_by,
      p_body => 'You now have full access to FlightraX.',
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
      p_body => new.rejection_reason,
      p_href => '/account',
      p_entity_type => 'account_request',
      p_entity_id => new.profile_id
    );

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
    -- The row itself is created by handle_new_user at auth signup, before
    -- any ID number or document exists, so INSERT is the wrong moment to
    -- tell a reviewer there is something to review. submitAccountRequest
    -- stamping submitted_at is the real submission.
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
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger account_requests_notify
  after update of approval_status, submitted_at on public.account_requests
  for each row execute function public.notify_account_request_changes();

-- A new admin is announced to superadmins. Triggered on admin_profiles
-- rather than profiles because that is where the department lands.
create function public.notify_admin_registered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select full_name into v_name from public.profiles where id = new.profile_id;

  perform public.create_notifications(
    p_user_ids => public.notification_audience_superadmins(),
    p_type => 'admin_registered',
    p_title => format(
      '%s registered as an admin',
      coalesce(v_name, 'A new user')
    ),
    p_actor_id => new.profile_id,
    p_body => format('Department: %s', replace(new.department::text, '_', ' ')),
    p_href => '/account-review',
    p_entity_type => 'profile',
    p_entity_id => new.profile_id
  );

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger admin_profiles_notify
  after insert on public.admin_profiles
  for each row execute function public.notify_admin_registered();

-- --------------------------------------------------------- flight requests

create function public.notify_flight_request_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_requester text;
  v_actor text;
begin
  if new.status = old.status then
    return null;
  end if;

  v_label := public.notification_flight_label(new.flight_plan_id);

  if new.status = 'pending_approval' then
    v_requester := public.notification_person_name(new.requested_by);

    perform public.create_notifications(
      p_user_ids => array[new.instructor_profile_id],
      p_type => 'flight_request_submitted',
      -- A rejected request is editable, so it returns straight to
      -- pending_approval. The instructor may have rejected this very
      -- request, so say which it is. Same type: it drives the icon and
      -- grouping, the title carries the nuance.
      p_title => format(
        '%s %s a flight request',
        coalesce(v_requester, 'A pilot'),
        case when old.status = 'rejected' then 'resubmitted' else 'submitted' end
      ),
      p_actor_id => new.requested_by,
      p_body => format('Flight %s is waiting for your review.', v_label),
      p_href => format('/flight-requests/%s', new.flight_plan_id),
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );

  elsif new.status = 'approved' then
    v_actor := public.notification_person_name(new.approved_by);

    perform public.create_notifications(
      p_user_ids => array[new.requested_by],
      p_type => 'flight_request_approved',
      p_title => format(
        '%s approved your flight request',
        coalesce(v_actor, 'A reviewer')
      ),
      p_actor_id => new.approved_by,
      p_body => format('Flight %s is approved.', v_label),
      p_href => format('/flight-documents/flight-plans/%s', new.flight_plan_id),
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );

    perform public.create_notifications(
      p_user_ids => public.notification_audience_department('air_traffic_controller'),
      p_type => 'flight_request_approved',
      p_title => format('Flight %s was approved', v_label),
      p_actor_id => new.approved_by,
      p_body => 'The filed flight plan is now available for review.',
      p_href => format('/flight-plans/%s', new.flight_plan_id),
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );

  elsif new.status = 'rejected' then
    v_actor := public.notification_person_name(new.rejected_by);

    perform public.create_notifications(
      p_user_ids => array[new.requested_by],
      p_type => 'flight_request_rejected',
      p_title => format(
        '%s rejected your flight request',
        coalesce(v_actor, 'A reviewer')
      ),
      p_actor_id => new.rejected_by,
      p_body => coalesce(
        new.rejected_reason,
        format('Flight %s was rejected.', v_label)
      ),
      p_href => format('/flight-documents/flight-plans/%s', new.flight_plan_id),
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );

  elsif old.status = 'pending_approval' and new.status = 'draft' then
    v_requester := public.notification_person_name(new.requested_by);

    perform public.create_notifications(
      p_user_ids => array[new.instructor_profile_id],
      p_type => 'flight_request_withdrawn',
      p_title => format(
        '%s withdrew their flight request',
        coalesce(v_requester, 'A pilot')
      ),
      p_actor_id => new.requested_by,
      p_body => format('Flight %s is no longer awaiting review.', v_label),
      p_href => '/flight-requests',
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );
  end if;

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger flight_requests_notify
  after update of status on public.flight_requests
  for each row execute function public.notify_flight_request_changes();

-- -------------------------------------------------------- flight lifecycle

create function public.notify_flight_journey_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_plan_id uuid;
  v_registration text;
  v_actor text;
  v_recipients uuid[];
begin
  if new.status = old.status then
    return null;
  end if;

  select fr.flight_plan_id, fp.aircraft_identification
    into v_plan_id, v_registration
  from public.flight_requests fr
  join public.flight_plans fp on fp.id = fr.flight_plan_id
  where fr.id = new.flight_request_id;

  v_label := public.notification_flight_label(v_plan_id);
  v_recipients := public.notification_audience_participants(new.flight_request_id);

  if new.status = 'active' then
    perform public.create_notifications(
      p_user_ids => v_recipients,
      p_type => 'flight_commenced',
      p_title => format('%s has departed', v_registration),
      p_actor_id => new.commenced_by,
      p_body => format('Flight %s is airborne.', v_label),
      p_href => '/dashboard',
      p_entity_type => 'flight_journey',
      p_entity_id => new.id
    );

  elsif new.status = 'arrived' then
    perform public.create_notifications(
      p_user_ids => v_recipients,
      p_type => 'flight_arrived',
      p_title => format('%s has arrived', v_registration),
      p_actor_id => new.terminated_by,
      p_body => format('Flight %s is complete.', v_label),
      p_href => '/dashboard',
      p_entity_type => 'flight_journey',
      p_entity_id => new.id
    );

  elsif new.status = 'cancelled' then
    -- The no-show cron sets cancelled_at but no cancelled_by, so a null
    -- actor is what separates an automatic cancellation from a person's.
    if new.cancelled_by is null then
      perform public.create_notifications(
        p_user_ids => v_recipients,
        p_type => 'flight_no_show',
        p_title => format('Flight %s was automatically cancelled', v_label),
        p_body => 'The flight did not commence on its date of flight (no-show).',
        p_href => '/dashboard',
        p_entity_type => 'flight_journey',
        p_entity_id => new.id
      );
    else
      v_actor := public.notification_person_name(new.cancelled_by);

      perform public.create_notifications(
        p_user_ids => v_recipients,
        p_type => 'flight_cancelled',
        p_title => format(
          '%s cancelled flight %s',
          coalesce(v_actor, 'A reviewer'),
          v_label
        ),
        p_actor_id => new.cancelled_by,
        p_body => format('%s is free for a new request.', v_registration),
        p_href => '/dashboard',
        p_entity_type => 'flight_journey',
        p_entity_id => new.id
      );
    end if;
  end if;

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger flight_journeys_notify
  after update of status on public.flight_journeys
  for each row execute function public.notify_flight_journey_changes();

-- ------------------------------------------------------------- broadcasts

create function public.notify_notam_posted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.create_notifications(
    p_user_ids => public.notification_audience_everyone(),
    p_type => 'notam_posted',
    p_title => format('%s NOTAM: %s', initcap(new.severity), new.title),
    p_actor_id => new.created_by,
    p_body => new.description,
    p_href => '/notams',
    p_entity_type => 'notam',
    p_entity_id => new.id
  );

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger notams_notify
  after insert on public.notams
  for each row execute function public.notify_notam_posted();

-- Rule C: an aircraft status change reaches only the people whose flight is
-- on that aircraft. Everyone else has the TV monitor. Each live journey gets
-- its own message because each names a different flight (Rule B1).
create function public.notify_aircraft_status_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_journey record;
begin
  if new.status = old.status then
    return null;
  end if;

  for v_journey in
    select fj.id, fj.flight_request_id, fr.flight_plan_id
    from public.flight_journeys fj
    join public.flight_requests fr on fr.id = fj.flight_request_id
    where fj.aircraft_id = new.id
      and fj.status in ('scheduled', 'active')
  loop
    perform public.create_notifications(
      p_user_ids => public.notification_audience_participants(v_journey.flight_request_id),
      p_type => 'aircraft_status_changed',
      p_title => format(
        '%s is now %s',
        new.registration_mark,
        replace(new.status::text, '_', ' ')
      ),
      p_body => format(
        'Your flight %s may be affected.',
        public.notification_flight_label(v_journey.flight_plan_id)
      ),
      p_href => '/dashboard',
      p_entity_type => 'aircraft',
      p_entity_id => new.id
    );
  end loop;

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger aircrafts_notify
  after update of status on public.aircrafts
  for each row execute function public.notify_aircraft_status_changed();

create function public.notify_instructor_unavailable()
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
    p_href => '/schedule',
    p_entity_type => 'instructor_unavailability',
    p_entity_id => new.id
  );

  return null;
exception
  when others then
    -- A notification must never take down the thing that caused it. These
    -- triggers run inside the caller's transaction: account_requests is
    -- written inside the auth signup transaction, and the flight triggers
    -- inside their action's, so an unhandled error here would roll back a
    -- registration, an approval or a commence. Skip the notification
    -- instead; the warning names the trigger and the Postgres error.
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;

create trigger instructor_unavailabilities_notify
  after insert on public.instructor_unavailabilities
  for each row execute function public.notify_instructor_unavailable();
