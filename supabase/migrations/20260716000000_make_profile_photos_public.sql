-- Make the profile-photos storage bucket public so the app can construct
-- public URLs synchronously instead of creating N signed URLs per list query.
--
-- Profile photos are student/instructor headshots — comparable to a school
-- directory photo. There is no sensitive information in them.
--
-- The existing RLS policies on storage.objects still apply for upload,
-- replace, and delete operations. Only the owning user can manage their
-- own photos. This change only affects read access: anyone with the URL
-- can now view a profile photo without authentication, which removes the
-- N+1 signed URL overhead from every list-heavy page (students list,
-- instructor list, dashboard profile header).
--
-- Before applying this migration, run the code change that replaces
-- createSignedUrl() calls with getPublicUrl() in:
--   modules/students/services/students.server.ts
--   modules/auth/queries/profile.ts
--   modules/auth/queries/authorization-profile.ts (if applicable)

update storage.buckets
set public = true
where id = 'profile-photos';
