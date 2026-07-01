alter table public.profiles
  add column if not exists license_type text,
  add column if not exists license_number text,
  add column if not exists rating text;

alter table public.profiles
  drop constraint if exists profiles_license_type_not_blank,
  add constraint profiles_license_type_not_blank check (
    license_type is null or btrim(license_type) <> ''
  );

alter table public.profiles
  drop constraint if exists profiles_license_number_not_blank,
  add constraint profiles_license_number_not_blank check (
    license_number is null or btrim(license_number) <> ''
  );

alter table public.profiles
  drop constraint if exists profiles_rating_not_blank,
  add constraint profiles_rating_not_blank check (
    rating is null or btrim(rating) <> ''
  );

create or replace function private.current_user_can_approve_students()
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
      and profiles.role in ('instructor', 'superadmin')
      and private.current_user_is_approved()
  )
$$;

create or replace function private.current_user_can_view_students()
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
      and profiles.role in ('instructor', 'superadmin')
      and private.current_user_is_approved()
  )
$$;

grant execute on function private.current_user_can_view_students() to authenticated;

drop policy if exists "Approved staff can read student profiles" on public.profiles;
create policy "Approved instructors and superadmins can read student profiles"
on public.profiles
for select
to authenticated
using (
  private.current_user_can_view_students()
  and role = 'student'
);

drop policy if exists "Approved staff can read student approval profiles" on public.student_profiles;
create policy "Approved instructors and superadmins can read student approval profiles"
on public.student_profiles
for select
to authenticated
using (private.current_user_can_view_students());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
  requested_department public.admin_department;
  license_type_value text;
  license_number_value text;
  rating_value text;
begin
  requested_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'requested_role', ''),
    'student'
  )::public.app_role;

  requested_department := nullif(
    new.raw_user_meta_data ->> 'admin_department',
    ''
  )::public.admin_department;

  if requested_role not in ('student', 'instructor') then
    license_type_value := null;
    license_number_value := null;
    rating_value := null;
  else
    license_type_value := nullif(btrim(new.raw_user_meta_data ->> 'license_type'), '');
    license_number_value := nullif(btrim(new.raw_user_meta_data ->> 'license_number'), '');
    rating_value := nullif(btrim(new.raw_user_meta_data ->> 'rating'), '');
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    license_type,
    license_number,
    rating
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    requested_role,
    license_type_value,
    license_number_value,
    rating_value
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
