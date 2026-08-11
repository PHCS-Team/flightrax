-- Peer privacy: instructors must not view each other's licenses/certificates.
-- Target read matrix (owner policies keep everyone's access to their own):
--   instructor viewer  -> student-owned only
--   student viewer     -> instructor-owned only
--   admin/superadmin   -> everything
--
-- Two layers need narrowing: the "approved users" policies added for the
-- instructors roster must exclude instructor viewers, and the older staff
-- policies must stop granting instructors row-wide reads (they were the OR'd
-- escape hatch that would keep peer credentials visible).

-- Roster policies: approved non-instructor viewers read instructor-owned rows.

drop policy if exists "Approved users can read instructor licenses" on public.licenses;
create policy "Approved users can read instructor licenses"
on public.licenses
for select
to authenticated
using (
  private.current_user_is_approved()
  and private.current_user_role() <> 'instructor'
  and private.is_instructor_profile(user_id)
);

drop policy if exists "Approved users can read instructor certificates" on public.certificates;
create policy "Approved users can read instructor certificates"
on public.certificates
for select
to authenticated
using (
  private.current_user_is_approved()
  and private.current_user_role() <> 'instructor'
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
  and private.current_user_role() <> 'instructor'
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
  and private.current_user_role() <> 'instructor'
  and private.is_instructor_profile(((storage.foldername(name))[1])::uuid)
);

-- Staff policies: instructors are limited to non-instructor (student) owners;
-- admins and superadmins keep full reads.

drop policy if exists "Approved instructors and superadmins can read licenses" on public.licenses;
create policy "Approved instructors and superadmins can read licenses"
on public.licenses
for select
to authenticated
using (
  private.current_user_can_view_students()
  and (
    private.current_user_role() in ('admin', 'superadmin')
    or not private.is_instructor_profile(user_id)
  )
);

drop policy if exists "Approved instructors and superadmins can read certificates" on public.certificates;
create policy "Approved instructors and superadmins can read certificates"
on public.certificates
for select
to authenticated
using (
  private.current_user_can_view_students()
  and (
    private.current_user_role() in ('admin', 'superadmin')
    or not private.is_instructor_profile(user_id)
  )
);

drop policy if exists "Approved staff can read license images" on storage.objects;
create policy "Approved staff can read license images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'license-images'
  and private.current_user_can_view_students()
  and (
    private.current_user_role() in ('admin', 'superadmin')
    or not private.is_instructor_profile(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "Approved staff can read certificate images" on storage.objects;
create policy "Approved staff can read certificate images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'certificate-images'
  and private.current_user_can_view_students()
  and (
    private.current_user_role() in ('admin', 'superadmin')
    or not private.is_instructor_profile(((storage.foldername(name))[1])::uuid)
  )
);
