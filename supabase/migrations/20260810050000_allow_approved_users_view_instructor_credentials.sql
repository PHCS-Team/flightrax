-- The instructors roster is visible to every approved user, but the row and
-- storage read policies for licenses/certificates only covered the owner and
-- staff — so instructor credentials opened by a student (or any non-staff
-- viewer) returned nothing and images showed as unavailable.
--
-- The owner-role check must run through a security definer helper: a plain
-- subquery on public.profiles inside a policy is evaluated as the caller,
-- whose own RLS on profiles hides the instructor's row.

create or replace function private.is_instructor_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = target_profile_id
      and profiles.role = 'instructor'
  )
$$;

grant execute on function private.is_instructor_profile(uuid) to authenticated;

drop policy if exists "Approved users can read instructor licenses" on public.licenses;
create policy "Approved users can read instructor licenses"
on public.licenses
for select
to authenticated
using (
  private.current_user_is_approved()
  and private.is_instructor_profile(user_id)
);

drop policy if exists "Approved users can read instructor certificates" on public.certificates;
create policy "Approved users can read instructor certificates"
on public.certificates
for select
to authenticated
using (
  private.current_user_is_approved()
  and private.is_instructor_profile(user_id)
);

drop policy if exists "Approved users can read instructor license images" on storage.objects;
create policy "Approved users can read instructor license images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'license-images'
  and private.current_user_is_approved()
  and private.is_instructor_profile(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Approved users can read instructor certificate images" on storage.objects;
create policy "Approved users can read instructor certificate images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'certificate-images'
  and private.current_user_is_approved()
  and private.is_instructor_profile(((storage.foldername(name))[1])::uuid)
);
