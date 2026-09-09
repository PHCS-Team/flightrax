-- A NOTAM notification pointed at /notams, which its own audience cannot
-- open.
--
-- notam_posted goes to EVERYONE, but /notams is guarded by NOTAMS_VIEW,
-- held only by safety_personnel admins (and superadmins, who short-circuit
-- every permission). A student or instructor tapping the notification was
-- bounced back to /dashboard by the route guard.
--
-- /dashboard is where they can actually read it: NotamsSection renders the
-- active NOTAMs on both dashboard home surfaces, and every approved role
-- holds DASHBOARD_VIEW.
--
-- Replaces the body from 20260910020000; the trigger is unchanged.

create or replace function public.notify_notam_posted()
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
    p_href => '/dashboard',
    p_entity_type => 'notam',
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
