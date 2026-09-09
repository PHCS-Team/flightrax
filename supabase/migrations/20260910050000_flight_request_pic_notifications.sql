-- The pilot in command was never notified about a flight request.
--
-- flight_request_submitted and flight_request_withdrawn went only to
-- flight_requests.instructor_profile_id, but the PIC is equally a reviewer:
-- canActOnFlightRequest lets either the assigned instructor or the pilot in
-- command approve or reject, and the review queue's "assigned" scope
-- filters on pilot_in_command_id OR instructor_profile_id. So a request
-- could sit in the PIC's queue with nothing telling them it was there.
--
-- Both are notified now, and each message says which role the recipient
-- holds. When one person is both, the roles collapse into a single row
-- reading "pilot in command and flight instructor" — that is what the
-- group by in the target query does, rather than sending two rows.
--
-- flight_plans.pilot_in_command_id is nullable, so the where clause drops
-- it when absent. Rule A still applies on top: create_notifications removes
-- the requester, so a student who is their own PIC, or an instructor who
-- files their own flight, is never notified about their own submission.

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
begin
  if new.status = old.status then
    return null;
  end if;

  v_label := public.notification_flight_label(new.flight_plan_id);

  select fp.pilot_in_command_id into v_pic
  from public.flight_plans fp
  where fp.id = new.flight_plan_id;

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
        -- A rejected request is editable and returns straight to
        -- pending_approval, so say which it is: the reviewer may have
        -- rejected this very request.
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
