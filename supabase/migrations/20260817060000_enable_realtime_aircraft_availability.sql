-- Broadcast changes that affect flight plan aircraft availability so an
-- open aircraft picker refreshes the moment an admin configures a type's
-- W&B specifications, an aircraft's basic empty weight, or its status.
-- Realtime respects RLS, and approved users can already read these tables.

alter publication supabase_realtime add table public.aircraft_types;
alter publication supabase_realtime add table public.aircraft_weight_balance_configs;
alter publication supabase_realtime add table public.aircrafts;
