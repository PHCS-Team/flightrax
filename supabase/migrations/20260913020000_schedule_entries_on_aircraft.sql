-- The board's rows are the fleet itself. The client's sheet lists every
-- aircraft every day, so asking the admin to add rows by hand each morning
-- was the wrong shape. Entries now hang directly off aircrafts, and
-- schedule_resources goes away.
--
-- Nothing has been posted yet, so the entries table is cleared rather than
-- migrated. (Verified empty before writing this.)

truncate table public.schedule_entries;

alter table public.schedule_entries
  drop constraint schedule_entries_no_overlap;

alter table public.schedule_entries
  drop column resource_id;

alter table public.schedule_entries
  add column aircraft_id uuid not null
    references public.aircrafts(id) on delete cascade;

create index schedule_entries_aircraft_time_idx
  on public.schedule_entries (aircraft_id, starts_at);

-- No double-booking: one aircraft cannot hold two entries whose time ranges
-- overlap. Rejected at insert rather than left as a silent conflict.
alter table public.schedule_entries
  add constraint schedule_entries_no_overlap exclude using gist (
    aircraft_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  );

drop table public.schedule_resources;
