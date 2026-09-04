-- One airframe, one identity: the registration mark (RP-C1884), the
-- registration number (1884), and the manufacturer serial number must each
-- be unique across the fleet. Compared case- and whitespace-insensitively
-- so "rp-c1884 " cannot slip past "RP-C1884". Nulls (no serial recorded)
-- never collide. If this fails to apply, the fleet already has duplicates
-- that must be resolved by hand first.
create unique index aircrafts_registration_mark_key
  on public.aircrafts (upper(btrim(registration_mark)));

create unique index aircrafts_registration_number_key
  on public.aircrafts (upper(btrim(registration_number)));

create unique index aircrafts_serial_number_key
  on public.aircrafts (upper(btrim(serial_number)));
