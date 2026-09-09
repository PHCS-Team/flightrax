-- Audience resolvers for the notifications matrix
-- (docs/NOTIFICATIONS-MATRIX.md §2). Each returns the uuid[] that a trigger
-- hands to create_notifications(), which applies Rule D (dedup) and Rule A
-- (drop the actor).
--
-- All are security definer: they are called from triggers, and
-- create_notifications() has execute revoked from public.

-- "Approved" is not a column on profiles. Students and instructors are
-- approved through account_requests; admins and superadmins never file a
-- request and are approved by definition (see getEffectiveApprovalStatus in
-- shared/lib/rbac/profile.ts — this function is the SQL mirror of it).
create function public.notification_approved_profiles()
returns table (profile_id uuid, profile_role public.app_role)
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.id, p.role
  from public.profiles p
  left join public.account_requests ar on ar.profile_id = p.id
  where p.role in ('admin', 'superadmin')
     or ar.approval_status = 'approved';
$$;

create function public.notification_audience_everyone()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(profile_id), '{}')
  from public.notification_approved_profiles();
$$;

create function public.notification_audience_role(p_role public.app_role)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(profile_id), '{}')
  from public.notification_approved_profiles()
  where profile_role = p_role;
$$;

-- Department membership lives on admin_profiles, and only role 'admin'
-- carries a department (getAdminDepartment).
create function public.notification_audience_department(
  p_department public.admin_department
)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(ap.profile_id), '{}')
  from public.admin_profiles ap
  join public.profiles p on p.id = ap.profile_id
  where ap.department = p_department
    and p.role = 'admin';
$$;

create function public.notification_audience_superadmins()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(id), '{}')
  from public.profiles
  where role = 'superadmin';
$$;

-- Rule C: the people on one flight — its trainee, pilot in command and
-- assigned instructor. These legitimately collapse onto one or two people;
-- create_notifications() dedups, so no caller has to.
create function public.notification_audience_participants(
  p_flight_request_id uuid
)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_remove(
      array[fr.requested_by, fp.pilot_in_command_id, fr.instructor_profile_id],
      null
    ),
    '{}'
  )
  from public.flight_requests fr
  join public.flight_plans fp on fp.id = fr.flight_plan_id
  where fr.id = p_flight_request_id;
$$;

-- Rule B1: a flight message must say which flight, because a user can hold
-- several requests on one day. Plan code is the discriminator shown in the
-- UI; registration and departure time make it recognisable without looking
-- the code up. Departure time is zulu, hence the Z.
create function public.notification_flight_label(p_flight_plan_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select format('%s (%s, %sZ)', plan_code, aircraft_identification, departure_time_raw)
  from public.flight_plans
  where id = p_flight_plan_id;
$$;

create function public.notification_person_name(p_profile_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select full_name from public.profiles where id = p_profile_id;
$$;

revoke all on function public.notification_approved_profiles() from public;
revoke all on function public.notification_audience_everyone() from public;
revoke all on function public.notification_audience_role(public.app_role) from public;
revoke all on function public.notification_audience_department(public.admin_department) from public;
revoke all on function public.notification_audience_superadmins() from public;
revoke all on function public.notification_audience_participants(uuid) from public;
revoke all on function public.notification_flight_label(uuid) from public;
revoke all on function public.notification_person_name(uuid) from public;
