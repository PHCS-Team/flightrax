insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles
  add column if not exists profile_photo_path text,
  add column if not exists profile_photo_content_type text,
  add column if not exists profile_photo_size_bytes integer,
  add column if not exists profile_photo_uploaded_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_profile_photo_content_type_check,
  add constraint profiles_profile_photo_content_type_check check (
    profile_photo_content_type is null
    or profile_photo_content_type in ('image/jpeg', 'image/png', 'image/webp')
  );

alter table public.profiles
  drop constraint if exists profiles_profile_photo_size_bytes_check,
  add constraint profiles_profile_photo_size_bytes_check check (
    profile_photo_size_bytes is null
    or (profile_photo_size_bytes > 0 and profile_photo_size_bytes <= 5242880)
  );

drop policy if exists "Users can upload own profile photos" on storage.objects;
drop policy if exists "Users can read own profile photos" on storage.objects;
drop policy if exists "Users can replace own profile photos" on storage.objects;
drop policy if exists "Users can delete own profile photos" on storage.objects;

create policy "Users can upload own profile photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can read own profile photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can replace own profile photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete own profile photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
