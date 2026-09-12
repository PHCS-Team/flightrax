-- Add ICAO designator to aircraft_types
alter table public.aircraft_types
add column if not exists icao_designator text;

comment on column public.aircraft_types.icao_designator is 'ICAO aircraft type designator (e.g., C172, PA28)';

-- Create registry table for aircraft registration marks
create table if not exists public.registry (
  id uuid primary key default gen_random_uuid(),
  registration_mark text not null unique,
  aircraft_id uuid references public.aircrafts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registry_registration_mark_not_blank check (btrim(registration_mark) <> '')
);

create index if not exists registry_registration_mark_idx on public.registry(registration_mark);
create index if not exists registry_aircraft_id_idx on public.registry(aircraft_id);

alter table public.registry enable row level security;

grant select, insert, update, delete on public.registry to authenticated;
grant select, insert, update, delete on public.registry to service_role;

create trigger registry_set_updated_at
  before update on public.registry
  for each row execute function public.set_updated_at();

create policy "Approved users can read registry"
on public.registry
for select
to authenticated
using (private.current_user_is_approved());

create policy "Flight operations staff can manage registry"
on public.registry
for all
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

-- Create time_schedule table with hourly time slot columns (6am - midnight)
create table if not exists public.time_schedule (
  id uuid primary key default gen_random_uuid(),
  schedule_date date not null,
  type_key text references public.aircraft_types(type_key) on delete set null,
  registry_id uuid references public.registry(id) on delete set null,
  -- Hourly time slot columns (6am to midnight)
  "06_07" text,
  "07_08" text,
  "08_09" text,
  "09_10" text,
  "10_11" text,
  "11_12" text,
  "12_13" text,
  "13_14" text,
  "14_15" text,
  "15_16" text,
  "16_17" text,
  "17_18" text,
  "18_19" text,
  "19_20" text,
  "20_21" text,
  "21_22" text,
  "22_23" text,
  "23_00" text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_schedule_unique_key unique (schedule_date, type_key, registry_id)
);

create index if not exists time_schedule_date_idx on public.time_schedule(schedule_date desc);
create index if not exists time_schedule_type_key_idx on public.time_schedule(type_key);
create index if not exists time_schedule_registry_id_idx on public.time_schedule(registry_id);

alter table public.time_schedule enable row level security;

grant select, insert, update, delete on public.time_schedule to authenticated;
grant select, insert, update, delete on public.time_schedule to service_role;

create trigger time_schedule_set_updated_at
  before update on public.time_schedule
  for each row execute function public.set_updated_at();

create policy "Approved users can read time_schedule"
on public.time_schedule
for select
to authenticated
using (private.current_user_is_approved());

create policy "Flight operations staff can manage time_schedule"
on public.time_schedule
for all
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

-- Backfill registry from existing aircrafts
insert into public.registry (registration_mark, aircraft_id)
select registration, id
from public.aircrafts
where not exists (
  select 1 from public.registry r where r.registration_mark = aircrafts.registration
)
on conflict (registration_mark) do update set aircraft_id = excluded.aircraft_id;