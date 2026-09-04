-- Item 9 of the CAAP flight plan wants the ICAO Doc 8643 type designator
-- (2–4 characters), which the app never stored. Backfill the fleet from
-- the type names, fall back to the first characters of the name for any
-- type we don't recognise, then make it required. Admins can correct a
-- designator from the type's W&B specifications dialog.
alter table public.aircraft_types
  add column icao_designator text;

update public.aircraft_types
set icao_designator = case
  when type ~* 'cessna\s*152' then 'C152'
  when type ~* 'cessna\s*172' then 'C172'
  when type ~* 'p\s*-?\s*2002' then 'SIRA'
  when type ~* 'p\s*-?\s*2006' then 'P06T'
  when type ~* 'p\s*-?\s*mentor' then 'PMEN'
  else upper(left(regexp_replace(type, '[^A-Za-z0-9]', '', 'g') || 'XX', 4))
end
where icao_designator is null;

alter table public.aircraft_types
  alter column icao_designator set not null,
  add constraint aircraft_types_icao_designator_check
    check (icao_designator ~ '^[A-Z0-9]{2,4}$');
