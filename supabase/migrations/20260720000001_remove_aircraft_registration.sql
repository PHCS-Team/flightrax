-- Remove the redundant registration column from aircrafts.
-- aircraft_identification serves the same purpose and is already required.

alter table public.aircrafts drop column registration;
drop index if exists public.aircrafts_registration_key;
