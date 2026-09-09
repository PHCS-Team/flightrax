-- Every flight plan must carry a pilot in command.
--
-- The application has always required it: flight-plan-schema.ts declares
-- pilotInCommandId as a non-optional uuid, and create-flight-plan and
-- update-flight-plan both write it and validate the chosen pilot. Only the
-- database column was left nullable, back in 20260817030000.
--
-- It matters now for the same reason instructor_profile_id did
-- (20260910000000): the PIC is a reviewer — canActOnFlightRequest lets
-- either them or the assigned instructor approve — and
-- flight_request_submitted / flight_request_withdrawn are addressed to
-- both. A null PIC would mean a request nobody is told about.
--
-- No backfill: unlike instructor_profile_id, which could be derived from
-- the PIC, there is no other column that reliably identifies the pilot in
-- command. There is no production data, so this is expected to be a no-op;
-- if it raises, clear the flight plans that have no pilot in command.

alter table public.flight_plans
  alter column pilot_in_command_id set not null;
