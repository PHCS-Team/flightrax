-- Training schedule: the board the admin posts and students read.
--
-- Two tables. schedule_resources is the row axis — whatever the school
-- operates, aircraft or simulator, in the order the board shows them.
-- schedule_entries is one row per coloured block: a resource, a time range,
-- a session type, and up to two people from the system.
--
-- This is deliberately independent of flight_requests. The schedule is
-- posted; the student reads it and files their own request. Any mismatch is
-- on the filing, not the posting.

create extension if not exists btree_gist with schema extensions;

-- ------------------------------------------------------------- resources

create table public.schedule_resources (
  id uuid primary key default gen_random_uuid(),
  -- Null for a simulator. An aircraft row points at the fleet so its
  -- registration and type stay in one place.
  aircraft_id uuid references public.aircrafts(id) on delete set null,
  display_name text not null,
  group_label text not null,
  -- The board's order is deliberate (types grouped, then registrations),
  -- not alphabetical.
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_resources_display_name_not_blank
    check (btrim(display_name) <> ''),
  constraint schedule_resources_display_name_key unique (display_name)
);

-- One board row per aircraft.
create unique index schedule_resources_aircraft_id_key
  on public.schedule_resources (aircraft_id)
  where aircraft_id is not null;

create index schedule_resources_sort_idx
  on public.schedule_resources (is_active, sort_order);

create trigger schedule_resources_set_updated_at
  before update on public.schedule_resources
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------- entries

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.schedule_resources(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- The legend. Fixed set, mirrored by SCHEDULE_SESSION_TYPES in
  -- modules/schedule/constants/session-types.ts.
  session_type text not null check (session_type in (
    'ps',    -- pre-solo simulator
    'taxi',  -- taxi exercise
    'lcl',   -- local flight
    'xc',    -- cross country
    'irs',   -- instrument simulator
    'caap',  -- CAAP checkride
    'cf',    -- company flight
    'ots',   -- out of service
    'tbd',   -- to be determined
    'ct',    -- cross trainees
    'uprt'   -- upset prevention and recovery training
  )),
  -- Named by position on the board, not by role: pilot is whoever is on the
  -- top line of the cell, instructor the "Capt." line. Either may hold any
  -- role — student with instructor, instructor with instructor, and so on.
  pilot_profile_id uuid references public.profiles(id) on delete set null,
  instructor_profile_id uuid references public.profiles(id) on delete set null,
  -- Free text where the board carries words instead of, or as well as,
  -- people: "Waiting for crankcase", "Test Flight".
  label text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_entries_range_check check (ends_at > starts_at),
  -- An out-of-service bar has nobody on it. Anything else needs at least
  -- one person, or it is a coloured block that says nothing.
  constraint schedule_entries_people_check check (
    session_type = 'ots'
    or pilot_profile_id is not null
    or instructor_profile_id is not null
  ),
  -- No double-booking: one resource cannot hold two entries whose time
  -- ranges overlap. On the paper board this cannot happen — one cell, one
  -- entry — so in the app it can only ever be a mistake, and it is rejected
  -- at insert rather than left as a silent conflict.
  constraint schedule_entries_no_overlap exclude using gist (
    resource_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
);

-- The board for a day: entries by resource, in time order.
create index schedule_entries_resource_time_idx
  on public.schedule_entries (resource_id, starts_at);

-- A day's entries regardless of resource, and "my schedule" for a person.
create index schedule_entries_starts_at_idx
  on public.schedule_entries (starts_at);

create index schedule_entries_pilot_idx
  on public.schedule_entries (pilot_profile_id)
  where pilot_profile_id is not null;

create index schedule_entries_instructor_idx
  on public.schedule_entries (instructor_profile_id)
  where instructor_profile_id is not null;

create trigger schedule_entries_set_updated_at
  before update on public.schedule_entries
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------- RLS
--
-- Everyone signed in reads the whole board, the same way everyone can read
-- the paper one. Writes go through server actions guarded by
-- SCHEDULE_MANAGE (flight operations personnel) using the service role, so
-- there are no insert/update/delete policies for clients.

alter table public.schedule_resources enable row level security;
alter table public.schedule_entries enable row level security;

create policy "Authenticated users can read schedule resources"
  on public.schedule_resources
  for select
  to authenticated
  using (true);

create policy "Authenticated users can read schedule entries"
  on public.schedule_entries
  for select
  to authenticated
  using (true);

grant select on public.schedule_resources to authenticated;
grant select on public.schedule_entries to authenticated;
