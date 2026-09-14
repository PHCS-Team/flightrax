-- "Schedule file uploaded" — sent the moment a workbook is posted.
--
-- Unlike the day board, which the admin builds entry by entry and then
-- pins up with a deliberate ping, an uploaded workbook is already final:
-- the school made it in Excel before it got here. So there is nothing to
-- wait for, and the upload itself is the announcement. The link opens the
-- workbook viewer, not the calendar, because the sheet is what people
-- need to read.

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
    'schedule_ready',
    'schedule_file_uploaded'
  ));

-- Called from uploadScheduleFileAction through the service role once the
-- upload row and its parsed sheets are all in, so a failed upload never
-- announces itself. Not a trigger for that reason: the row is inserted
-- before the sheets, and a trigger would fire too early. Same audience as
-- the ping — everyone who can open /schedule. create_notifications()
-- drops the actor (Rule A) and dedups (Rule D); the insert trigger fans
-- out to push.
create function public.notify_schedule_file_uploaded(p_upload_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upload public.schedule_uploads%rowtype;
  v_range text;
  v_sent integer;
begin
  select * into v_upload
  from public.schedule_uploads
  where id = p_upload_id;

  if not found then
    return 0;
  end if;

  v_range := case
    when v_upload.starts_on = v_upload.ends_on
      then to_char(v_upload.starts_on, 'Dy, Mon FMDD')
    when date_trunc('month', v_upload.starts_on) = date_trunc('month', v_upload.ends_on)
      then to_char(v_upload.starts_on, 'Mon FMDD') || '-' || to_char(v_upload.ends_on, 'FMDD')
    else to_char(v_upload.starts_on, 'Mon FMDD') || ' - ' || to_char(v_upload.ends_on, 'Mon FMDD')
  end;

  select public.create_notifications(
    p_user_ids => public.notification_audience_everyone(),
    p_type => 'schedule_file_uploaded',
    p_title => format('Flight schedule for %s is up', v_range),
    p_actor_id => v_upload.uploaded_by,
    p_body => format(
      '%s uploaded %s. Open it to see your schedule and file your flight request.',
      public.notification_person_name(v_upload.uploaded_by),
      coalesce(v_upload.label, regexp_replace(v_upload.file_name, '\.xlsx$', '', 'i'))
    ),
    p_href => '/schedule/uploads/' || v_upload.id::text,
    p_entity_type => 'schedule_upload',
    p_entity_id => v_upload.id
  ) into v_sent;

  return v_sent;
end;
$$;

revoke all on function public.notify_schedule_file_uploaded(uuid) from public;
revoke all on function public.notify_schedule_file_uploaded(uuid) from anon, authenticated;
