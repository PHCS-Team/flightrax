-- NOTAMs are announcements: a post or deletion by a Safety admin must show
-- on every open dashboard and the NOTAMs page without a refresh.
--
-- Budget (Rule 19): a handful of writes per day fanned out to concurrent
-- dashboard viewers — well under the free-tier message quota. Delivery
-- follows the existing RLS policy (any authenticated user can select), so
-- every signed-in client receives every event, which is the intent.
alter publication supabase_realtime add table public.notams;
