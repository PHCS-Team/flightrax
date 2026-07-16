create type public.aircraft_status as enum (
  'active',
  'maintenance',
  'grounded',
  'retired'
);

-- ── Aircraft types (lookup table, referenced by aircrafts) ──────────────

create function private.generate_aircraft_type_key(p_type text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(regexp_replace(btrim(p_type), '[^a-zA-Z0-9]+', '_', 'g'), '^_|_$', '', 'g'));
$$;

create function private.current_user_can_manage_aircrafts()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    left join public.admin_profiles on admin_profiles.profile_id = profiles.id
    where profiles.id = (select auth.uid())
      and private.current_user_is_approved()
      and (
        profiles.role in ('instructor', 'superadmin')
        or (
          profiles.role = 'admin'
          and admin_profiles.department = 'flight_operations_personnel'
        )
      )
  )
$$;

grant execute on function private.current_user_can_manage_aircrafts() to authenticated;

create table public.aircraft_types (
  type_key text primary key,
  type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aircraft_types_type_not_blank check (btrim(type) <> '')
);

create index aircraft_types_created_at_idx on public.aircraft_types(created_at asc);

alter table public.aircraft_types enable row level security;

grant select, insert, update, delete on public.aircraft_types to authenticated;
grant select, insert, update, delete on public.aircraft_types to service_role;

create trigger aircraft_types_set_updated_at
  before update on public.aircraft_types
  for each row execute function public.set_updated_at();

create policy "Approved users can read aircraft types"
on public.aircraft_types
for select
to authenticated
using (private.current_user_is_approved());

create policy "Flight operations staff can create aircraft types"
on public.aircraft_types
for insert
to authenticated
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can update aircraft types"
on public.aircraft_types
for update
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can delete aircraft types"
on public.aircraft_types
for delete
to authenticated
using (private.current_user_can_manage_aircrafts());

-- ── Aircrafts ──────────────────────────────────────────────────────────

create table public.aircrafts (
  id uuid primary key default gen_random_uuid(),
  registration text not null,
  model text not null,
  aircraft_identification text not null,
  aircraft_type text not null references public.aircraft_types(type_key),
  serial_number text,
  color_markings text not null,
  remarks text,
  status public.aircraft_status not null default 'active',
  photo_path text,
  photo_content_type text,
  photo_size_bytes integer,
  photo_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aircrafts_registration_not_blank check (btrim(registration) <> ''),
  constraint aircrafts_model_not_blank check (btrim(model) <> ''),
  constraint aircrafts_aircraft_identification_not_blank check (
    btrim(aircraft_identification) <> ''
  ),
  constraint aircrafts_color_markings_not_blank check (btrim(color_markings) <> ''),
  constraint aircrafts_remarks_not_blank check (
    remarks is null or btrim(remarks) <> ''
  ),
  constraint aircrafts_photo_content_type_check check (
    photo_content_type is null
    or photo_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint aircrafts_photo_size_bytes_check check (
    photo_size_bytes is null
    or (photo_size_bytes > 0 and photo_size_bytes <= 5242880)
  ),
  constraint aircrafts_photo_metadata_complete_check check (
    (
      photo_path is null
      and photo_content_type is null
      and photo_size_bytes is null
      and photo_uploaded_at is null
    )
    or (
      photo_path is not null
      and photo_content_type is not null
      and photo_size_bytes is not null
      and photo_uploaded_at is not null
    )
  )
);

create unique index aircrafts_registration_key on public.aircrafts(registration);
create index aircrafts_status_idx on public.aircrafts(status);
create index aircrafts_created_at_idx on public.aircrafts(created_at desc);

alter table public.aircrafts enable row level security;

grant select, insert, update, delete on public.aircrafts to authenticated;
grant select, insert, update, delete on public.aircrafts to service_role;

create trigger aircrafts_set_updated_at
  before update on public.aircrafts
  for each row execute function public.set_updated_at();

create policy "Approved users can read aircrafts"
on public.aircrafts
for select
to authenticated
using (private.current_user_is_approved());

create policy "Flight operations staff can create aircrafts"
on public.aircrafts
for insert
to authenticated
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can update aircrafts"
on public.aircrafts
for update
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can delete aircrafts"
on public.aircrafts
for delete
to authenticated
using (private.current_user_can_manage_aircrafts());

-- ── Weight & balance config (1:1 per aircraft) ─────────────────────────

create table public.aircraft_weight_balance_configs (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid not null references public.aircrafts(id) on delete cascade,
  basic_empty_weight numeric(10,2) not null,
  arm numeric(10,2) not null,
  moment numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aircraft_weight_balance_configs_aircraft_id_key unique (aircraft_id),
  constraint aircraft_weight_balance_configs_basic_empty_weight_check check (basic_empty_weight > 0),
  constraint aircraft_weight_balance_configs_arm_check check (arm > 0),
  constraint aircraft_weight_balance_configs_moment_check check (moment > 0)
);

alter table public.aircraft_weight_balance_configs enable row level security;

grant select, insert, update, delete on public.aircraft_weight_balance_configs to authenticated;
grant select, insert, update, delete on public.aircraft_weight_balance_configs to service_role;

create trigger aircraft_weight_balance_configs_set_updated_at
  before update on public.aircraft_weight_balance_configs
  for each row execute function public.set_updated_at();

create policy "Approved users can read weight & balance configs"
on public.aircraft_weight_balance_configs
for select
to authenticated
using (
  exists (
    select 1
    from public.aircrafts
    where aircrafts.id = aircraft_weight_balance_configs.aircraft_id
      and private.current_user_is_approved()
  )
);

create policy "Flight operations staff can manage weight & balance configs"
on public.aircraft_weight_balance_configs
for insert
to authenticated
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can update weight & balance configs"
on public.aircraft_weight_balance_configs
for update
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can delete weight & balance configs"
on public.aircraft_weight_balance_configs
for delete
to authenticated
using (private.current_user_can_manage_aircrafts());

-- ── Storage bucket for aircraft photos ─────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aircraft-photos',
  'aircraft-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Approved users can read aircraft photos" on storage.objects;
drop policy if exists "Flight operations staff can upload aircraft photos" on storage.objects;
drop policy if exists "Flight operations staff can replace aircraft photos" on storage.objects;
drop policy if exists "Flight operations staff can delete aircraft photos" on storage.objects;

create policy "Approved users can read aircraft photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'aircraft-photos'
  and private.current_user_is_approved()
);

create policy "Flight operations staff can upload aircraft photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'aircraft-photos'
  and private.current_user_can_manage_aircrafts()
);

create policy "Flight operations staff can replace aircraft photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'aircraft-photos'
  and private.current_user_can_manage_aircrafts()
)
with check (
  bucket_id = 'aircraft-photos'
  and private.current_user_can_manage_aircrafts()
);

create policy "Flight operations staff can delete aircraft photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'aircraft-photos'
  and private.current_user_can_manage_aircrafts()
);
