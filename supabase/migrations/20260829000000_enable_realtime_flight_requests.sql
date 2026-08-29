-- Live flight request updates: a submitted request appears in the PIC's
-- review queue the moment it is filed, and an approval or rejection
-- reaches the owner's flight documents list without a refresh.
--
-- Realtime respects RLS with the subscriber's JWT, and the existing
-- policies already shape the fan-out correctly: owners receive events
-- for their own requests (requested_by = auth.uid()), while approved
-- instructors and superadmins receive events for all of them.

alter publication supabase_realtime add table public.flight_requests;
