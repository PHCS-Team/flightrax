-- The superadmin can deactivate an admin instead of deleting them: approvals,
-- schedules, NOTAMs and flights reference the admin's profile, so the row
-- (and the name on that history) must stay. Deactivation bans the auth user
-- and stamps this column; the app hides deactivated admins from the Admins
-- table and treats the account as locked out on its next request.
alter table public.profiles
  add column deactivated_at timestamptz;
