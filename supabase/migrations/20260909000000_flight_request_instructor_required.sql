-- Every flight request must carry an assigned flight instructor.
--
-- The application has always required this: flight-plan-schema.ts declares
-- instructorId as a non-optional uuid, and both create-flight-plan and
-- update-flight-plan reject an id that is not an instructor profile. The
-- column was left nullable in 20260904100000 only so that migration could
-- backfill the rows that existed at the time.
--
-- The notifications matrix (docs/NOTIFICATIONS-MATRIX.md) routes
-- flight_request_submitted and flight_request_withdrawn to the assigned
-- instructor and to nobody else, so a null here would mean a request no
-- one is told about. Enforce it at the database level.

-- Best-effort backfill for any row the earlier migration could not resolve,
-- using the pilot in command where that pilot is an instructor.
update public.flight_requests fr
set instructor_profile_id = fp.pilot_in_command_id
from public.flight_plans fp
join public.profiles p on p.id = fp.pilot_in_command_id
where fp.id = fr.flight_plan_id
  and fr.instructor_profile_id is null
  and p.role in ('instructor', 'superadmin');

-- Any row still null has no resolvable instructor and cannot satisfy the
-- constraint. There is no production data, so this is expected to be a
-- no-op; if it raises, clear the unresolvable rows and re-run.
alter table public.flight_requests
  alter column instructor_profile_id set not null;
