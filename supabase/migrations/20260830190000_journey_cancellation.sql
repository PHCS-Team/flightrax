-- Cancelling a flight: only sensible while the journey is still
-- scheduled (an emergency before takeoff). A cancelled journey releases
-- the aircraft's (aircraft_id, dof_date) slot — the partial unique
-- index only covers scheduled/active — so the next request for the
-- same aircraft and DOF can be submitted and approved.

alter table public.flight_journeys
  add column cancelled_at timestamptz,
  add column cancelled_by uuid references public.profiles(id);
