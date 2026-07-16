-- Aircraft photos are not sensitive (just plane pictures).
-- Making the bucket public avoids N signed-url calls on every list load.

update storage.buckets
set public = true
where id = 'aircraft-photos';

-- RLS for reads is no longer needed on a public bucket, but keeping
-- the upload/replace/delete policies so only flight ops staff can manage photos.
drop policy if exists "Approved users can read aircraft photos" on storage.objects;
