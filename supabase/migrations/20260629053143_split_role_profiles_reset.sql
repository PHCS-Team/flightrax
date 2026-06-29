-- Disposable-development reset from the first auth/RBAC profile schema.
-- This migration intentionally drops and recreates the profile layer with
-- role-specific one-to-one tables instead of cramming role data into profiles.

create schema if not exists private;

-- Drop old policies first so dependent tables/functions can be replaced cleanly.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Approved staff can read student profiles" on public.profiles;
drop policy if exists "Superadmins can read all profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Staff can approve students" on public.profiles;

-- Drop trigger/function objects from the original migration.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_set_updated_at on public.profiles;
drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();
drop function if exists private.current_user_role();
drop function if exists private.current_user_department();
drop function if exists private.current_user_can_approve_students();

-- Drop replacement tables if this reset has been run manually during development.
drop table if exists private.instructor_credentials;
drop table if exists public.instructor_profiles;
drop table if exists public.admin_profiles;
drop table if exists public.student_profiles;
drop table if exists public.profiles;

-- Recreate enum types from scratch for a clean dev reset.
drop type if exists public.approval_status;
drop type if exists public.admin_department;
drop type if exists public.app_role;

create type public.app_role as enum (
  'student',
  'instructor',
  'admin',
  'superadmin'
);

create type public.admin_department as enum (
  'flight_operations_personnel',
  'air_traffic_controller',
  'safety_personnel'
);

create type public.approval_status as enum (
  'pending',
  'approved',
  'rejected'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  approval_status public.approval_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  rejected_at timestamptz,
  rejected_by uuid references public.profiles(id),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_approval_state_consistent check (
    (approval_status = 'pending' and approved_at is null and rejected_at is null)
    or (approval_status = 'approved' and approved_at is not null and rejected_at is null)
    or (approval_status = 'rejected' and approved_at is null and rejected_at is not null)
  )
);

create table public.admin_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  department public.admin_department not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instructor_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.instructor_credentials (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  passcode_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index student_profiles_approval_status_idx on public.student_profiles(approval_status);
create index admin_profiles_department_idx on public.admin_profiles(department);

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table private.instructor_credentials enable row level security;

grant usage on schema private to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.student_profiles to authenticated;
grant select, insert on public.admin_profiles to authenticated;
grant select, insert on public.instructor_profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.student_profiles to service_role;
grant select, insert, update, delete on public.admin_profiles to service_role;
grant select, insert, update, delete on public.instructor_profiles to service_role;
grant select, insert, update, delete on private.instructor_credentials to service_role;

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

create trigger instructor_profiles_set_updated_at
  before update on public.instructor_profiles
  for each row execute function public.set_updated_at();

create trigger instructor_credentials_set_updated_at
  before update on private.instructor_credentials
  for each row execute function public.set_updated_at();

create function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
$$;

create function private.current_user_student_approval_status()
returns public.approval_status
language sql
stable
security definer
set search_path = ''
as $$
  select student_profiles.approval_status
  from public.student_profiles
  where student_profiles.profile_id = (select auth.uid())
$$;

create function private.current_user_department()
returns public.admin_department
language sql
stable
security definer
set search_path = ''
as $$
  select admin_profiles.department
  from public.admin_profiles
  where admin_profiles.profile_id = (select auth.uid())
$$;

create function private.current_user_is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    case
      when profiles.role = 'student' then student_profiles.approval_status = 'approved'
      else true
    end,
    false
  )
  from public.profiles
  left join public.student_profiles on student_profiles.profile_id = profiles.id
  where profiles.id = (select auth.uid())
$$;

create function private.current_user_can_approve_students()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('instructor', 'admin', 'superadmin')
      and private.current_user_is_approved()
  )
$$;

grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_user_student_approval_status() to authenticated;
grant execute on function private.current_user_department() to authenticated;
grant execute on function private.current_user_is_approved() to authenticated;
grant execute on function private.current_user_can_approve_students() to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
  requested_department public.admin_department;
begin
  requested_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'requested_role', ''),
    'student'
  )::public.app_role;

  requested_department := nullif(
    new.raw_user_meta_data ->> 'admin_department',
    ''
  )::public.admin_department;

  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    requested_role
  );

  if requested_role = 'student' then
    insert into public.student_profiles (profile_id)
    values (new.id);
  elsif requested_role = 'admin' then
    insert into public.admin_profiles (profile_id, department)
    values (new.id, requested_department);
  elsif requested_role = 'instructor' then
    insert into public.instructor_profiles (profile_id)
    values (new.id);
    insert into private.instructor_credentials (profile_id)
    values (new.id);
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Approved staff can read student profiles"
on public.profiles
for select
to authenticated
using (
  private.current_user_can_approve_students()
  and role = 'student'
);

create policy "Superadmins can read all profiles"
on public.profiles
for select
to authenticated
using (private.current_user_role() = 'superadmin');

create policy "Users can read own student profile"
on public.student_profiles
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Approved staff can read student approval profiles"
on public.student_profiles
for select
to authenticated
using (private.current_user_can_approve_students());

create policy "Staff can approve students"
on public.student_profiles
for update
to authenticated
using (
  private.current_user_can_approve_students()
  and profile_id <> (select auth.uid())
)
with check (
  private.current_user_can_approve_students()
  and profile_id <> (select auth.uid())
);

create policy "Users can read own admin profile"
on public.admin_profiles
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Superadmins can read all admin profiles"
on public.admin_profiles
for select
to authenticated
using (private.current_user_role() = 'superadmin');

create policy "Users can read own instructor profile"
on public.instructor_profiles
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Superadmins can read all instructor profiles"
on public.instructor_profiles
for select
to authenticated
using (private.current_user_role() = 'superadmin');
