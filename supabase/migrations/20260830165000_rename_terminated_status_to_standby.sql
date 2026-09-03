-- The client's vocabulary: commence → active, terminate → arrived,
-- and after an hour the aircraft goes back to standby. The leftover
-- 'terminated' enum value (never written by any flow) collided with
-- the "Terminate flight" action, which sets 'arrived' — rename it so
-- the stored status says what it means.

alter type public.journey_status rename value 'terminated' to 'standby';
