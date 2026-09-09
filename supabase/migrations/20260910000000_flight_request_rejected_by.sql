-- Record who rejected a flight request.
--
-- approve sets approved_by, but reject clears it (see
-- reject-flight-request.ts) and stores only rejected_reason, so the
-- rejecting reviewer was not recorded anywhere. The notifications matrix
-- words this event as "<Instructor> rejected your flight request", and the
-- trigger reads the actor from the row, so the column has to exist.
--
-- Mirrors account_requests, which already keeps approved_by and
-- rejected_by side by side.

alter table public.flight_requests
  add column rejected_by uuid references public.profiles(id);
