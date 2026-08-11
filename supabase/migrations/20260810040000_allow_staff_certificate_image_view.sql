-- Staff reviewing rosters can view certificate images, mirroring the
-- existing "Approved staff can read license images" storage policy.

drop policy if exists "Approved staff can read certificate images" on storage.objects;
create policy "Approved staff can read certificate images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'certificate-images'
  and private.current_user_can_view_students()
);
