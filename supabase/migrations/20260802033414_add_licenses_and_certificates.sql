-- Licenses & certificates: replace the license fields embedded in profiles
-- with proper one-to-many tables. Every user can hold many licenses (with an
-- ID document photo on the front and back) and many certificates (single image).

-- ── Remove embedded license fields from profiles ─────────────────────────

alter table public.profiles
  drop constraint if exists profiles_license_type_not_blank,
  drop constraint if exists profiles_license_number_not_blank,
  drop constraint if exists profiles_rating_not_blank,
  drop column if exists license_type,
  drop column if exists license_number,
  drop column if exists rating;

-- ── Licenses ─────────────────────────────────────────────────────────────

create type public.license_status as enum (
  'active',
  'expired'
);

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  license_type text not null,
  license_number text not null,
  rating text,
  expiry_date date,
  status public.license_status not null default 'active',
  id_front_path text,
  id_front_content_type text,
  id_front_size_bytes integer,
  id_front_uploaded_at timestamptz,
  id_back_path text,
  id_back_content_type text,
  id_back_size_bytes integer,
  id_back_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint licenses_license_type_not_blank check (btrim(license_type) <> ''),
  constraint licenses_license_number_not_blank check (btrim(license_number) <> ''),
  constraint licenses_rating_not_blank check (rating is null or btrim(rating) <> ''),
  constraint licenses_id_front_content_type_check check (
    id_front_content_type is null
    or id_front_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint licenses_id_front_size_bytes_check check (
    id_front_size_bytes is null
    or (id_front_size_bytes > 0 and id_front_size_bytes <= 5242880)
  ),
  constraint licenses_id_front_metadata_complete_check check (
    (
      id_front_path is null
      and id_front_content_type is null
      and id_front_size_bytes is null
      and id_front_uploaded_at is null
    )
    or (
      id_front_path is not null
      and id_front_content_type is not null
      and id_front_size_bytes is not null
      and id_front_uploaded_at is not null
    )
  ),
  constraint licenses_id_back_content_type_check check (
    id_back_content_type is null
    or id_back_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint licenses_id_back_size_bytes_check check (
    id_back_size_bytes is null
    or (id_back_size_bytes > 0 and id_back_size_bytes <= 5242880)
  ),
  constraint licenses_id_back_metadata_complete_check check (
    (
      id_back_path is null
      and id_back_content_type is null
      and id_back_size_bytes is null
      and id_back_uploaded_at is null
    )
    or (
      id_back_path is not null
      and id_back_content_type is not null
      and id_back_size_bytes is not null
      and id_back_uploaded_at is not null
    )
  )
);

create index licenses_user_id_idx on public.licenses(user_id);
create index licenses_status_idx on public.licenses(status);
create index licenses_created_at_idx on public.licenses(created_at desc);

alter table public.licenses enable row level security;

grant select, insert, update, delete on public.licenses to authenticated;
grant select, insert, update, delete on public.licenses to service_role;

create trigger licenses_set_updated_at
  before update on public.licenses
  for each row execute function public.set_updated_at();

create policy "Users can read own licenses"
on public.licenses
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Approved instructors and superadmins can read licenses"
on public.licenses
for select
to authenticated
using (private.current_user_can_view_students());

create policy "Users can create own licenses"
on public.licenses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own licenses"
on public.licenses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own licenses"
on public.licenses
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ── Certificates ─────────────────────────────────────────────────────────

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  image_path text,
  image_content_type text,
  image_size_bytes integer,
  image_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificates_description_not_blank check (btrim(description) <> ''),
  constraint certificates_image_content_type_check check (
    image_content_type is null
    or image_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint certificates_image_size_bytes_check check (
    image_size_bytes is null
    or (image_size_bytes > 0 and image_size_bytes <= 5242880)
  ),
  constraint certificates_image_metadata_complete_check check (
    (
      image_path is null
      and image_content_type is null
      and image_size_bytes is null
      and image_uploaded_at is null
    )
    or (
      image_path is not null
      and image_content_type is not null
      and image_size_bytes is not null
      and image_uploaded_at is not null
    )
  )
);

create index certificates_user_id_idx on public.certificates(user_id);
create index certificates_created_at_idx on public.certificates(created_at desc);

alter table public.certificates enable row level security;

grant select, insert, update, delete on public.certificates to authenticated;
grant select, insert, update, delete on public.certificates to service_role;

create trigger certificates_set_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

create policy "Users can read own certificates"
on public.certificates
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Approved instructors and superadmins can read certificates"
on public.certificates
for select
to authenticated
using (private.current_user_can_view_students());

create policy "Users can create own certificates"
on public.certificates
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own certificates"
on public.certificates
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own certificates"
on public.certificates
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ── Storage: license ID images (front & back) ────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'license-images',
  'license-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own license images" on storage.objects;
drop policy if exists "Users can read own license images" on storage.objects;
drop policy if exists "Users can replace own license images" on storage.objects;
drop policy if exists "Users can delete own license images" on storage.objects;

create policy "Users can upload own license images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'license-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can read own license images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'license-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can replace own license images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'license-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'license-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete own license images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'license-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ── Storage: certificate images ──────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificate-images',
  'certificate-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own certificate images" on storage.objects;
drop policy if exists "Users can read own certificate images" on storage.objects;
drop policy if exists "Users can replace own certificate images" on storage.objects;
drop policy if exists "Users can delete own certificate images" on storage.objects;

create policy "Users can upload own certificate images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'certificate-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can read own certificate images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'certificate-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can replace own certificate images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'certificate-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'certificate-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete own certificate images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'certificate-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
