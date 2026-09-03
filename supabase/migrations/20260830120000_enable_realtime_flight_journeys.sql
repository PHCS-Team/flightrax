-- Live flight status monitoring: a commence/terminate by anyone must
-- appear on every open dashboard board without a refresh.
--
-- Realtime respects RLS with the subscriber's JWT. The existing select
-- policies only cover journey owners and reviewers, so events for other
-- people's flights would be silently filtered out for students watching
-- the board. Journeys carry nothing sensitive (status + timestamps), so
-- every approved user may read them.

create policy "Approved users can read flight journeys"
on public.flight_journeys
for select
to authenticated
using (private.current_user_is_approved());

alter publication supabase_realtime add table public.flight_journeys;
