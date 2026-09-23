-- A certificate can carry up to five images: front and back, or a
-- multi-page certificate. The image_* columns on certificates stay exactly as
-- they are and hold the main image; this table holds the additional ones, so
-- nothing that already reads a certificate's image has to change.
create table public.certificate_images (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  position smallint not null,
  image_path text not null,
  image_content_type text not null,
  image_size_bytes integer not null,
  image_uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificate_images_position_check check (position between 1 and 4),
  constraint certificate_images_content_type_check check (
    image_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint certificate_images_size_bytes_check check (
    image_size_bytes > 0 and image_size_bytes <= 5242880
  ),
  constraint certificate_images_position_key unique (certificate_id, position)
);

create index certificate_images_certificate_idx
  on public.certificate_images(certificate_id, position);

alter table public.certificate_images enable row level security;

grant select on public.certificate_images to authenticated;
grant select, insert, update, delete on public.certificate_images to service_role;

create trigger certificate_images_set_updated_at
  before update on public.certificate_images
  for each row execute function public.set_updated_at();

-- Reads mirror the certificates table: the owner, plus the staff who may
-- view student credentials. Writes go through the service role.
create policy "Users can read own certificate images"
on public.certificate_images
for select
to authenticated
using (
  exists (
    select 1
    from public.certificates
    where certificates.id = certificate_images.certificate_id
      and certificates.user_id = (select auth.uid())
  )
);

create policy "Approved instructors and superadmins can read certificate images"
on public.certificate_images
for select
to authenticated
using (private.current_user_can_view_students());
