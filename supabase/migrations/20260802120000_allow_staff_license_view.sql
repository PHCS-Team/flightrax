-- Allow admins to view student licenses (students page is now visible to admins)
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
      and profiles.role in ('instructor', 'admin', 'superadmin')
      and private.current_user_is_approved()
  )
$$;

grant execute on function private.current_user_can_view_students() to authenticated;

-- Allow approved staff (instructors/admins/superadmins) to read any license image
-- so they can view student ID photos from the students table.
drop policy if exists "Approved staff can read license images" on storage.objects;

create policy "Approved staff can read license images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'license-images'
  and private.current_user_can_view_students()
);
