-- Item 9 (type of aircraft) on the filed form is the ICAO designator.
-- Snapshot it on the plan at filing, like the registration mark and colour
-- and markings, so a later correction to the aircraft type never rewrites
-- a document that was already filed. Existing plans take their aircraft's
-- current designator — the best evidence of what was true when filed.
alter table public.flight_plans
  add column aircraft_type_designator text;

update public.flight_plans fp
set aircraft_type_designator = t.icao_designator
from public.aircrafts a
join public.aircraft_types t on t.type_key = a.aircraft_type
where a.id = fp.aircraft_id
  and fp.aircraft_type_designator is null;

-- Plans whose aircraft was deleted keep null rather than a guess; the PDF
-- prints an empty Item 9 for them.
