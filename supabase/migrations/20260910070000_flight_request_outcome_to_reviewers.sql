-- Approval and rejection reached only the requester, so the other reviewer
-- was never told the review was over.
--
-- A flight plan carries two reviewers, the pilot in command and the
-- assigned flight instructor, and either may act (canActOnFlightRequest).
-- When one of them acted, the other was left holding a
-- "waiting for your review" notification that never resolved.
--
-- Worse in the self-approval case, which is a first-class flow
-- (SelfApproveAction: "You are the pilot in command or the flight
-- instructor on this flight plan, so you can approve your own request"):
-- the requester is the actor, Rule A drops them, and the event produced
-- *no* notifications at all while the other reviewer still believed the
-- request was pending.
--
-- Outcomes now reach the requester and both reviewers. Two calls, because
-- the wording differs: the requester reads "your flight request", the
-- reviewers read "the flight request" plus a line saying no further review
-- is needed. The requester is removed from the reviewer group so nobody can
-- receive both (Rule D), and create_notifications still drops the actor
-- (Rule A) and dedups a PIC who is also the instructor.

create or replace function public.notify_flight_request_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_requester text;
  v_actor text;
  v_pic uuid;
  v_target record;
  v_other_reviewers uuid[];
begin
  if new.status = old.status then
    return null;
  end if;

  v_label := public.notification_flight_label(new.flight_plan_id);

  select fp.pilot_in_command_id into v_pic
  from public.flight_plans fp
  where fp.id = new.flight_plan_id;

  -- The reviewers, minus the requester, who always gets the "your request"
  -- wording instead. Nulls and the actor are dropped downstream.
  v_other_reviewers := array_remove(
    array[v_pic, new.instructor_profile_id],
    new.requested_by
  );

  if new.status = 'pending_approval' then
    v_requester := public.notification_person_name(new.requested_by);

    for v_target in
      select uid, string_agg(role_name, ' and ' order by ord) as roles
      from (
        select v_pic as uid, 'pilot in command' as role_name, 1 as ord
        union all
        select new.instructor_profile_id, 'flight instructor', 2
      ) t
      where uid is not null
      group by uid
    loop
      perform public.create_notifications(
        p_user_ids => array[v_target.uid],
        p_type => 'flight_request_submitted',
        p_title => format(
          '%s %s a flight request',
          coalesce(v_requester, 'A pilot'),
          case when old.status = 'rejected' then 'resubmitted' else 'submitted' end
        ),
        p_actor_id => new.requested_by,
        p_body => format(
          'You are the %s for flight %s. It is waiting for your review.',
          v_target.roles,
          v_label
        ),
        p_href => format('/flight-requests/%s', new.flight_plan_id),
        p_entity_type => 'flight_request',
        p_entity_id => new.id
      );
    end loop;

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
      p_user_ids => v_other_reviewers,
      p_type => 'flight_request_approved',
      p_title => format(
        '%s approved the flight request',
        coalesce(v_actor, 'A reviewer')
      ),
      p_actor_id => new.approved_by,
      p_body => format(
        'Flight %s is approved. No further review is needed.',
        v_label
      ),
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

    perform public.create_notifications(
      p_user_ids => v_other_reviewers,
      p_type => 'flight_request_rejected',
      p_title => format(
        '%s rejected the flight request',
        coalesce(v_actor, 'A reviewer')
      ),
      p_actor_id => new.rejected_by,
      p_body => format(
        'Flight %s was rejected. No further review is needed.',
        v_label
      ),
      p_href => format('/flight-documents/flight-plans/%s', new.flight_plan_id),
      p_entity_type => 'flight_request',
      p_entity_id => new.id
    );

  elsif old.status = 'pending_approval' and new.status = 'draft' then
    v_requester := public.notification_person_name(new.requested_by);

    for v_target in
      select uid, string_agg(role_name, ' and ' order by ord) as roles
      from (
        select v_pic as uid, 'pilot in command' as role_name, 1 as ord
        union all
        select new.instructor_profile_id, 'flight instructor', 2
      ) t
      where uid is not null
      group by uid
    loop
      perform public.create_notifications(
        p_user_ids => array[v_target.uid],
        p_type => 'flight_request_withdrawn',
        p_title => format(
          '%s withdrew their flight request',
          coalesce(v_requester, 'A pilot')
        ),
        p_actor_id => new.requested_by,
        p_body => format(
          'You are the %s for flight %s. It is no longer awaiting review.',
          v_target.roles,
          v_label
        ),
        p_href => '/flight-requests',
        p_entity_type => 'flight_request',
        p_entity_id => new.id
      );
    end loop;
  end if;

  return null;
exception
  when others then
    raise warning 'notification trigger % on %.% skipped: %',
      tg_name, tg_table_schema, tg_table_name, sqlerrm;

    return null;
end;
$$;
