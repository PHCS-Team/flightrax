# FlightraX — Flight Plan & Weight Balance Configurations

Based on CAAP Form ATS 2019-1, standard aircraft weight & balance documentation, and the flight school workflow.

---

## Workflow

```
Student                  Instructor
   │                        │
   ├─ Sets signature ───────┤─ Sets signature
   │   (account settings)   │   (account settings)
   │                        │
   ├─ Fills Flight Plan ────┤
   │   (draft)              │
   ├─ Submits → auto-signed │
   │   (status: submitted)  │
   │                        ├─ Reviews Flight Plan
   │                        ├─ Approves → auto-signed
   │                        │   (status: approved)
   │◄──── approved ─────────┤
   │                        │    OR
   │◄──── rejected ─────────┤
   │   (status: rejected,   │
   │    resubmit allowed)   │
   │                        │
   ├─ Fills W&B Form ───────┤
   │   (prerequisite: FP    │
   │    must be approved)   │
   ├─ Submits → auto-signed │
   │   (status: submitted)  │
   │                        ├─ Reviews W&B
   │                        ├─ Approves → auto-signed
   │                        │   (status: approved)
   │◄──── done ─────────────┤
```

**Key rules:**

- Each user stores one signature in account settings (SVG drawn on canvas)
- On submit → the student's signature is copied from their profile to the form (audit trail)
- On approve → the instructor's signature is copied from their profile to the form
- A signature copy is taken at the moment of the action so future profile changes don't rewrite history
- Flight Plan must be in `approved` status before a W&B form can be created for that flight

---

## 1. Profile Changes

Add a signature field to the existing `profiles` table so students and instructors can save their signature to their account.

```sql
alter table public.profiles
  add column if not exists signature_svg text;
```

`signature_svg` stores the raw SVG path data from a canvas-based signature pad. No image uploads needed — just vector paths that scale cleanly and render at any size.

Each user (student, instructor, admin, etc.) can set their signature in account settings. SVG is chosen because:

- Scales without pixelation for print / PDF export
- Small storage (a few KB per signature)
- Rendered inline as `<svg>` in the browser
- Works on mobile touch, mouse, or stylus

---

## 2. Flight Plans Table

```sql
create table public.flight_plans (
  id                uuid primary key default gen_random_uuid(),
  -- References
  student_id        uuid not null references public.profiles(id),
  instructor_id     uuid references public.profiles(id),     -- assigned instructor
  aircraft_id       uuid not null references public.aircrafts(id),
  -- Signatures (copied from profiles at time of action)
  student_signature_svg    text,                             -- copied from profile on submit
  student_signed_at        timestamptz,                      -- set on submit
  instructor_signature_svg text,                             -- copied from profile on approve/reject
  instructor_signed_at     timestamptz,                      -- set on approve/reject
  -- Status workflow
  status            text not null default 'draft'
                      check (status in ('draft','submitted','approved','rejected')),
  rejected_reason   text,
  -- Item 7
  aircraft_identification text not null,                     -- copied from aircraft for audit trail
  -- Item 8
  flight_rules      text not null check (flight_rules in ('IFR','VFR','Y','Z')),
  type_of_flight    text not null check (type_of_flight in ('S','N','G','M','X')),
  -- Item 9
  wake_turbulence   text not null check (wake_turbulence in ('H','M','L')),
  -- Item 10
  equipment_comm_nav      text[] default '{}',
  equipment_transponder   text[] default '{}',
  -- Item 13
  departure_aerodrome text not null,
  eobt              timestamptz not null,
  -- Item 15
  cruising_speed    text,
  cruising_level    text,
  route             text,
  -- Item 16
  destination_aerodrome  text not null,
  total_eet         interval,
  alternate_aerodrome    text,
  alternate_aerodrome_2  text,
  -- Item 18 (structured sub-fields stored as JSONB for flexibility)
  field_18          jsonb default '{}',
  field_18_raw      text,                                    -- original text input
  -- Item 19
  endurance              interval,
  persons_on_board       integer,
  emergency_radio        text[] default '{}',
  survival_equipment     text[] default '{}',
  life_jackets           text[] default '{}',
  dinghies_number        integer,
  dinghies_capacity      integer,
  dinghies_cover         boolean,
  dinghies_colour        text,
  -- Item A (from aircraft profile, copied for audit)
  aircraft_colour_markings text,
  -- Item C
  pilot_in_command     text not null,
  supplementary_remarks text,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Constraints
  constraint flight_plans_status_consistent check (
    (status = 'draft'     and student_signed_at is null  and instructor_signed_at is null)
    or (status = 'submitted' and student_signed_at is not null  and instructor_signed_at is null)
    or (status = 'approved'   and student_signed_at is not null  and instructor_signed_at is not null)
    or (status = 'rejected'   and student_signed_at is not null  and instructor_signed_at is not null)
  )
);

-- Indexes
create index flight_plans_student_id_idx on public.flight_plans(student_id);
create index flight_plans_instructor_id_idx on public.flight_plans(instructor_id);
create index flight_plans_status_idx on public.flight_plans(status);
create index flight_plans_created_at_idx on public.flight_plans(created_at desc);
```

---

## 3. Flight Weight & Balances Table

```sql
create table public.flight_weight_balances (
  id                uuid primary key default gen_random_uuid(),
  -- References
  flight_plan_id    uuid not null references public.flight_plans(id) on delete cascade,
  student_id        uuid not null references public.profiles(id),
  instructor_id     uuid references public.profiles(id),
  -- Signatures (copied from profiles at time of action)
  student_signature_svg    text,
  student_signed_at        timestamptz,
  instructor_signature_svg text,
  instructor_signed_at     timestamptz,
  -- Status workflow
  status            text not null default 'draft'
                      check (status in ('draft','submitted','approved','rejected')),
  rejected_reason   text,
  -- Weight Inputs
  basic_empty_weight   numeric(10,2) not null,       -- from aircraft config
  bew_arm              numeric(10,2) not null,        -- from aircraft config
  bew_moment           numeric(10,2) not null,        -- from aircraft config or computed
  fuel_gallons         numeric(6,2) not null,
  fuel_arm             numeric(10,2) not null,        -- from aircraft config
  instructor_weight    numeric(5,1),                  -- lbs
  student_weight       numeric(5,1),                  -- lbs
  crew_arm             numeric(10,2) not null,        -- standard seat arm
  baggage_weight       numeric(6,2),
  baggage_arm          numeric(10,2) not null,        -- from aircraft config
  -- Computed (filled by application on submit)
  fuel_weight          numeric(8,2),
  fuel_moment          numeric(10,2),
  crew_weight          numeric(8,2),
  crew_moment          numeric(10,2),
  baggage_moment       numeric(10,2),
  total_weight         numeric(10,2),
  total_moment         numeric(10,2),
  cg_position          numeric(10,4),                 -- inches from datum
  is_within_envelope   boolean,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Constraints
  constraint flight_weight_balances_flight_plan_id_key unique (flight_plan_id),
  constraint flight_weight_balances_status_consistent check (
    (status = 'draft'     and student_signed_at is null  and instructor_signed_at is null)
    or (status = 'submitted' and student_signed_at is not null  and instructor_signed_at is null)
    or (status = 'approved'   and student_signed_at is not null  and instructor_signed_at is not null)
    or (status = 'rejected'   and student_signed_at is not null  and instructor_signed_at is not null)
  )
);

-- Indexes
create index flight_weight_balances_flight_plan_id_idx on public.flight_weight_balances(flight_plan_id);
create index flight_weight_balances_status_idx on public.flight_weight_balances(status);
```

---

## 4. W&B Computation Reference

```
Fuel Weight  = Fuel Gallons × Fuel Density Factor
Crew Weight  = Instructor Weight + Student Weight
Total Weight = BEW + Fuel Weight + Crew Weight + Baggage Weight

Fuel Moment      = Fuel Weight × Fuel Arm
BEW Moment       = Basic Empty Weight × BEW Arm
Crew Moment      = Crew Weight × Crew Arm
Baggage Moment   = Baggage Weight × Baggage Arm
Total Moment     = BEW Moment + Fuel Moment + Crew Moment + Baggage Moment

CG Position      = Total Moment ÷ Total Weight   (inches from datum)
Is Within Envelope = (CG Position BETWEEN forward_limit AND aft_limit)
```

Fuel density factor comes from aircraft config:

- **Tecnam** (P2002JF, P2002T): `0.72 × 2.2` (kg-to-lbs conversion)
- **Cessna** (152, 172): `6` (lbs per US gallon)

---

## 5. Existing Tables Already Connected

| Table                             | Role                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| `profiles`                        | Student + instructor data, signature_svg (new column), license info |
| `aircrafts`                       | Aircraft assignment, colour/markings                                |
| `aircraft_types`                  | ICAO type codes                                                     |
| `aircraft_weight_balance_configs` | Aircraft static W&B values (BEW, arm, moment)                       |

---

## 6. Implementation Order

```
Phase 1 — Profile Signature
  ├── Add signature_svg column to profiles (migration)
  ├── Signature pad component (canvas → SVG)
  ├── Account settings page update
  └── API to save signature

Phase 2 — Flight Plan CRUD
  ├── flight_plans table (migration)
  ├── RLS policies
  ├── Server actions + schemas + types
  ├── Flight plan form (all ICAO fields)
  ├── Submit → auto-sign from profile
  ├── Instructor review page
  ├── Approve/Reject → auto-sign instructor
  └── TanStack Query hooks

Phase 3 — Weight & Balance
  ├── flight_weight_balances table (migration)
  ├── RLS policies
  ├── Server actions + schemas + types
  ├── W&B form with live CG calculator
  ├── Aircraft config prefill
  ├── Submit → auto-sign
  ├── Instructor review + approve/reject
  └── TanStack Query hooks

Phase 4 — Dashboard & Schedule
  ├── Student: "My flight plans" list
  ├── Instructor: "Pending reviews" queue
  ├── Schedule page shows flight plans
  ├── PDF print generation
  └── Monitoring page
```
