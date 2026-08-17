-- Flight plan requests — phase 1: data structures.
--
-- A flight request bundles two separately filed forms: the flight plan
-- (CAAP Form ATS 2019-1, can be drafted the night before once schedules
-- are posted) and the weight & balance sheet (filled on site after
-- measurement). The request leaves draft only when both exist and are
-- linked. Once approved, the journey row tracks the flight lifecycle.
--
-- Snapshot columns are deliberate: filed forms are audit records, so
-- aircraft, pilot, license, and signature data is copied at filing time
-- and never rewritten by later profile or fleet edits.

-- ── Enums ───────────────────────────────────────────────────────────────

create type public.journey_status as enum (
  'scheduled', 'active', 'on_ground', 'arrived', 'terminated', 'cancelled'
);

-- ── Flight plans ────────────────────────────────────────────────────────

create table public.flight_plans (
  id uuid primary key default gen_random_uuid(),

  -- Section 1
  addressee text,
  dof_raw text not null,
  dof_resolved timestamptz not null,
  originator text,

  -- Section 2
  message_type text not null default 'FPL',
  aircraft_id uuid references public.aircrafts(id),
  aircraft_identification text not null, -- snapshot: aircrafts.aircraft_identification
  flight_rules text not null,
  type_of_flight text not null,
  number_of_aircraft smallint not null default 1,
  type_of_aircraft text not null, -- snapshot: aircrafts.aircraft_type
  wake_turbulence_category text not null,
  com_nav_equipment text[] not null default '{}',
  surveillance_equipment text[] not null default '{}',
  departure_aerodrome char(4) not null default 'ZZZZ',
  departure_time_raw text not null,
  departure_time_resolved time not null,
  cruising_speed text not null,
  cruising_level text not null,
  route text[] not null default '{}',
  destination_aerodrome char(4) not null default 'ZZZZ',
  total_eet interval not null,
  first_alternate_aerodrome char(4),
  second_alternate_aerodrome char(4),
  other_remarks text,

  -- Section 3
  endurance interval,
  persons_on_board text not null default '000',
  emergency_radio_uhf boolean not null default false,
  emergency_radio_vhf boolean not null default false,
  emergency_radio_elt boolean not null default false,
  survival_polar boolean not null default false,
  survival_desert boolean not null default false,
  survival_maritime boolean not null default false,
  survival_jungle boolean not null default false,
  jacket_light boolean not null default false,
  jacket_fluorescent boolean not null default false,
  jacket_uhf boolean not null default false,
  jacket_vhf boolean not null default false,
  dinghies_has_dinghy boolean not null default false,
  dinghies_number smallint,
  dinghies_capacity smallint,
  dinghies_covered boolean not null default false,
  dinghies_color text,
  aircraft_color_and_marking text not null, -- snapshot: aircrafts.color_markings
  remarks text,

  pilot_in_command_id uuid references public.profiles(id),
  pilot_in_command_name text, -- snapshot: profiles.full_name (PIC — FI or self)
  filed_by_id uuid not null references public.profiles(id),
  pilot_name text not null, -- snapshot: profiles.full_name (filer)
  pilot_signature text, -- snapshot: profiles.signature_svg
  pilot_licenses jsonb not null default '[]'::jsonb, -- snapshot: licenses rows for filed_by_id
  authorized_representative_id uuid references public.profiles(id),
  authorized_representative_name text,
  authorized_representative_signature text,
  authorized_representative_licenses jsonb,

  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint flight_plans_dof_raw_check check (dof_raw ~ '^\d{6}$'),
  constraint flight_plans_flight_rules_check
    check (flight_rules in ('I', 'V', 'Y', 'Z')),
  constraint flight_plans_type_of_flight_check
    check (type_of_flight in ('S', 'N', 'G', 'M', 'X')),
  constraint flight_plans_number_of_aircraft_check
    check (number_of_aircraft between 1 and 999),
  constraint flight_plans_wake_turbulence_category_check
    check (wake_turbulence_category in ('H', 'M', 'L')),
  constraint flight_plans_com_nav_equipment_check
    check (com_nav_equipment <@ array['N', 'S']),
  constraint flight_plans_surveillance_equipment_check
    check (surveillance_equipment <@ array['N', 'A', 'C']),
  constraint flight_plans_departure_time_raw_check
    check (departure_time_raw ~ '^([01]\d|2[0-3])[0-5]\d$'),
  constraint flight_plans_cruising_speed_check
    check (cruising_speed ~ '^(K\d{4}|N\d{4}|M\d{3})$'),
  constraint flight_plans_cruising_level_check
    check (cruising_level = 'VFR' or cruising_level ~ '^(F\d{3}|S\d{4}|A\d{3}|M\d{4})$'),
  constraint flight_plans_persons_on_board_check
    check (persons_on_board = 'TBN' or persons_on_board ~ '^\d{3}$'),
  constraint flight_plans_dinghies_number_check
    check (dinghies_number is null or dinghies_number between 0 and 99),
  constraint flight_plans_dinghies_capacity_check
    check (dinghies_capacity is null or dinghies_capacity between 0 and 999)
);

create index flight_plans_filed_by_id_idx on public.flight_plans(filed_by_id);
create index flight_plans_created_by_idx on public.flight_plans(created_by);
create index flight_plans_aircraft_id_idx on public.flight_plans(aircraft_id);
create index flight_plans_dof_resolved_idx on public.flight_plans(dof_resolved desc);

alter table public.flight_plans enable row level security;

grant select, insert, update, delete on public.flight_plans to authenticated;
grant select, insert, update, delete on public.flight_plans to service_role;

create trigger flight_plans_set_updated_at
  before update on public.flight_plans
  for each row execute function public.set_updated_at();

create policy "Users can manage own flight plans"
on public.flight_plans
for all
to authenticated
using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

create policy "Approved instructors and superadmins can read flight plans"
on public.flight_plans
for select
to authenticated
using (private.current_user_can_view_students());

-- ── Weight & balances (per flight, snapshot of configs at filing) ───────

create table public.weight_balances (
  id uuid primary key default gen_random_uuid(),
  aircraft_id uuid references public.aircrafts(id),

  basic_empty_weight numeric(10,2), -- snapshot from aircraft config, editable
  basic_empty_weight_arm numeric(10,2),
  basic_empty_weight_moment numeric(10,2),

  usable_fuel_weight numeric(10,2),
  usable_fuel_arm numeric(10,2), -- snapshot from type config, editable
  usable_fuel_moment numeric(10,2),

  fi_and_student_weight numeric(10,2),
  fi_and_student_arm numeric(10,2), -- snapshot from type config, editable
  fi_and_student_moment numeric(10,2),

  total_weight numeric(10,2),
  total_cg numeric(10,2), -- CG range slot (total moment / total weight), editable, not auto-computed
  total_moment numeric(10,2),

  maximum_takeoff_weight numeric(10,2), -- snapshot from type config
  max_baggage_weight numeric(10,2) not null default 0, -- snapshot from type config

  weight_status text,
  balance_status text,

  prepared_by_id uuid not null references public.profiles(id),
  prepared_by_name text not null, -- snapshot: profiles.full_name (filer)
  prepared_by_signature text, -- snapshot: profiles.signature_svg

  verified_by_id uuid references public.profiles(id), -- set at verification, not filing
  verified_by_name text, -- snapshot: profiles.full_name (verifier)
  verified_by_signature text, -- snapshot: profiles.signature_svg

  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint weight_balances_weight_status_check
    check (weight_status is null or weight_status in ('within_limits', 'overweight')),
  constraint weight_balances_balance_status_check
    check (balance_status is null or balance_status in ('balanced', 'nose_heavy', 'tail_heavy')),
  constraint weight_balances_max_baggage_weight_check
    check (max_baggage_weight >= 0)
);

create index weight_balances_aircraft_id_idx on public.weight_balances(aircraft_id);
create index weight_balances_created_by_idx on public.weight_balances(created_by);

alter table public.weight_balances enable row level security;

grant select, insert, update, delete on public.weight_balances to authenticated;
grant select, insert, update, delete on public.weight_balances to service_role;

create trigger weight_balances_set_updated_at
  before update on public.weight_balances
  for each row execute function public.set_updated_at();

create policy "Users can manage own weight balances"
on public.weight_balances
for all
to authenticated
using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

create policy "Approved instructors and superadmins can read weight balances"
on public.weight_balances
for select
to authenticated
using (private.current_user_can_view_students());

-- ── Weight & balance baggage entries (dynamic per aircraft type) ────────

create table public.weight_balance_baggage_entries (
  id uuid primary key default gen_random_uuid(),
  weight_balance_id uuid not null
    references public.weight_balances(id) on delete cascade,

  position smallint not null,
  weight numeric(10,2) not null default 0,
  arm numeric(10,2), -- snapshot: aircraft_type_baggage_areas.arm at filing, editable
  moment numeric(10,2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint weight_balance_baggage_entries_position_check check (position > 0),
  constraint weight_balance_baggage_entries_weight_check check (weight >= 0),
  constraint weight_balance_baggage_entries_position_key
    unique (weight_balance_id, position)
);

create index weight_balance_baggage_entries_wb_idx
  on public.weight_balance_baggage_entries(weight_balance_id);

alter table public.weight_balance_baggage_entries enable row level security;

grant select, insert, update, delete on public.weight_balance_baggage_entries to authenticated;
grant select, insert, update, delete on public.weight_balance_baggage_entries to service_role;

create trigger weight_balance_baggage_entries_set_updated_at
  before update on public.weight_balance_baggage_entries
  for each row execute function public.set_updated_at();

create policy "Users can manage own weight balance baggage entries"
on public.weight_balance_baggage_entries
for all
to authenticated
using (
  exists (
    select 1
    from public.weight_balances
    where weight_balances.id = weight_balance_baggage_entries.weight_balance_id
      and weight_balances.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.weight_balances
    where weight_balances.id = weight_balance_baggage_entries.weight_balance_id
      and weight_balances.created_by = (select auth.uid())
  )
);

create policy "Approved instructors and superadmins can read baggage entries"
on public.weight_balance_baggage_entries
for select
to authenticated
using (private.current_user_can_view_students());

-- ── Flight requests (bundles the two forms, drives approval) ────────────

create table public.flight_requests (
  id uuid primary key default gen_random_uuid(),
  flight_plan_id uuid not null unique references public.flight_plans(id),
  weight_balance_id uuid unique references public.weight_balances(id), -- nullable: plan can exist before W&B is filled

  status text not null default 'draft',

  requested_by uuid not null references public.profiles(id),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  rejected_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint flight_requests_status_check
    check (status in ('draft', 'pending_approval', 'approved', 'rejected'))
);

create index flight_requests_status_idx on public.flight_requests(status);
create index flight_requests_requested_by_idx on public.flight_requests(requested_by);

alter table public.flight_requests enable row level security;

grant select, insert, update, delete on public.flight_requests to authenticated;
grant select, insert, update, delete on public.flight_requests to service_role;

create trigger flight_requests_set_updated_at
  before update on public.flight_requests
  for each row execute function public.set_updated_at();

create policy "Users can manage own flight requests"
on public.flight_requests
for all
to authenticated
using ((select auth.uid()) = requested_by)
with check ((select auth.uid()) = requested_by);

create policy "Approved instructors and superadmins can read flight requests"
on public.flight_requests
for select
to authenticated
using (private.current_user_can_view_students());

create policy "Approved instructors and superadmins can update flight requests"
on public.flight_requests
for update
to authenticated
using (private.current_user_can_view_students())
with check (private.current_user_can_view_students());

-- ── Flight journeys (post-approval lifecycle tracking) ──────────────────

create table public.flight_journeys (
  id uuid primary key default gen_random_uuid(),
  flight_request_id uuid not null unique references public.flight_requests(id),

  status public.journey_status not null default 'scheduled',

  commenced_by uuid references public.profiles(id),
  commenced_at timestamptz,

  terminated_by uuid references public.profiles(id),
  terminated_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index flight_journeys_status_idx on public.flight_journeys(status);

alter table public.flight_journeys enable row level security;

grant select, insert, update, delete on public.flight_journeys to authenticated;
grant select, insert, update, delete on public.flight_journeys to service_role;

create trigger flight_journeys_set_updated_at
  before update on public.flight_journeys
  for each row execute function public.set_updated_at();

create policy "Users can read own flight journeys"
on public.flight_journeys
for select
to authenticated
using (
  exists (
    select 1
    from public.flight_requests
    where flight_requests.id = flight_journeys.flight_request_id
      and flight_requests.requested_by = (select auth.uid())
  )
);

create policy "Approved instructors and superadmins can manage flight journeys"
on public.flight_journeys
for all
to authenticated
using (private.current_user_can_view_students())
with check (private.current_user_can_view_students());
