-- Category was never surfaced anywhere users act on it; severity carries
-- the signal. `if exists` keeps this safe on a database where the column
-- was already removed by hand.
alter table public.notams
  drop column if exists category;
