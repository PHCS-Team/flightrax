create schema if not exists private;

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
  admin_department public.admin_department,
  approval_status public.approval_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  rejected_at timestamptz,
  rejected_by uuid references public.profiles(id),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_admin_department_required check (
    (role = 'admin' and admin_department is not null)
    or (role <> 'admin' and admin_department is null)
  ),
  constraint profiles_approval_state_consistent check (
    (approval_status = 'pending' and approved_at is null and rejected_at is null)
    or (approval_status = 'approved' and approved_at is not null and rejected_at is null)
    or (approval_status = 'rejected' and approved_at is null and rejected_at is not null)
  )
);

create index profiles_role_idx on public.profiles(role);
create index profiles_approval_status_idx on public.profiles(approval_status);
create index profiles_admin_department_idx on public.profiles(admin_department)
where admin_department is not null;

alter table public.profiles enable row level security;

grant usage on schema private to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

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
    and approval_status = 'approved'
$$;

create function private.current_user_department()
returns public.admin_department
language sql
stable
security definer
set search_path = ''
as $$
  select admin_department
  from public.profiles
  where id = (select auth.uid())
    and approval_status = 'approved'
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
    where id = (select auth.uid())
      and approval_status = 'approved'
      and role in ('instructor', 'admin', 'superadmin')
  )
$$;

grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_user_department() to authenticated;
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
  initial_status public.approval_status;
begin
  requested_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'requested_role', ''),
    'student'
  )::public.app_role;

  requested_department := nullif(
    new.raw_user_meta_data ->> 'admin_department',
    ''
  )::public.admin_department;

  if requested_role <> 'admin' then
    requested_department := null;
  end if;

  initial_status := case
    when requested_role in ('instructor', 'admin', 'superadmin') then 'approved'::public.approval_status
    else 'pending'::public.approval_status
  end;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    admin_department,
    approval_status,
    approved_at
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    requested_role,
    requested_department,
    initial_status,
    case when initial_status = 'approved' then now() else null end
  );

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

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Staff can approve students"
on public.profiles
for update
to authenticated
using (
  role = 'student'
  and private.current_user_can_approve_students()
  and (
    private.current_user_role() in ('instructor', 'superadmin')
    or private.current_user_department() = admin_department
  )
)
with check (
  role = 'student'
  and private.current_user_can_approve_students()
  and (
    private.current_user_role() in ('instructor', 'superadmin')
    or private.current_user_department() = admin_department
  )
);
