-- Flight operations admins were notified about NOTAMs they cannot read.
--
-- They hold no NOTAMS_VIEW, so /notams is closed to them, and
-- getDashboardHomeSurface routes their /dashboard to the "aircrafts"
-- surface (FlightOperationsHome), which does not render NotamsSection.
-- Every other role lands on "flight-board" or "organized-board", both of
-- which show NOTAMs. So this one department had nowhere to read a NOTAM
-- while still receiving a notification pointing at /dashboard.
--
-- Their remit is aircraft and user management, not airspace notices.

create function public.notification_audience_everyone_except_department(
  p_department public.admin_department
)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(ap.profile_id), '{}')
  from public.notification_approved_profiles() ap
  where not exists (
    select 1
    from public.admin_profiles adm
    where adm.profile_id = ap.profile_id
      and adm.department = p_department
  );
$$;

revoke all on function
  public.notification_audience_everyone_except_department(public.admin_department)
  from public;

create or replace function public.notify_notam_posted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.create_notifications(
    p_user_ids => public.notification_audience_everyone_except_department(
      'flight_operations_personnel'
    ),
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
