-- Instructor unavailability periods, set by admins from the instructors
-- page. One row per leave period; a single-day leave has
-- starts_on = ends_on. All dates are zulu calendar dates, compared
-- against the UTC date of a flight plan's resolved DOF.
--
-- Housekeeping: rows whose ends_on has passed are useless (no audit
-- requirement) — the add-unavailability action deletes all expired rows
-- opportunistically on every write, so the table self-prunes without a
-- scheduled job.

-- Needed for the overlap exclusion constraint below.
create extension if not exists btree_gist;

create table public.instructor_unavailabilities (
  id uuid primary key default gen_random_uuid(),
  instructor_profile_id uuid not null
    references public.instructor_profiles(profile_id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instructor_unavailabilities_range_check
    check (ends_on >= starts_on),
  -- Two leave periods for the same instructor can never overlap.
  constraint instructor_unavailabilities_no_overlap
    exclude using gist (
      instructor_profile_id with =,
      daterange(starts_on, ends_on, '[]') with &&
    )
);

create index instructor_unavailabilities_instructor_ends_idx
  on public.instructor_unavailabilities(instructor_profile_id, ends_on);

create trigger instructor_unavailabilities_set_updated_at
  before update on public.instructor_unavailabilities
  for each row execute function public.set_updated_at();

alter table public.instructor_unavailabilities enable row level security;

-- Availability is not sensitive: any signed-in user may read it (the
-- instructors page status column and the PIC picker both need it).
-- There are no write policies on purpose — writes go through admin-only
-- server actions using the service role.
create policy "Authenticated users can read instructor unavailability"
on public.instructor_unavailabilities
for select
to authenticated
using (true);
