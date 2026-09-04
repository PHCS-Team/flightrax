-- Filed flight plans and W&B sheets are documents: every human-readable
-- text value is stored in upper case, exactly as it prints on the forms.
--
-- 1. flight_plans.type_of_aircraft used to hold the aircraft_types key
--    ("cessna_152"). It now holds the type NAME in caps ("CESSNA 152");
--    Item 9's designator has its own snapshot column.
update public.flight_plans fp
set type_of_aircraft = upper(t.type)
from public.aircraft_types t
where t.type_key = fp.type_of_aircraft;

comment on column public.flight_plans.type_of_aircraft is
  'snapshot: aircraft type name at filing, upper case';

-- 2. Upper-case existing text on both tables. Check-constrained codes
--    (flight_rules, type_of_flight, wake_turbulence_category, equipment)
--    are already single upper-case letters; weight_status/balance_status
--    are lower-case enums by constraint and are left alone, as are
--    signatures, license snapshots, plan codes, and identifiers.
update public.flight_plans
set
  addressee = upper(addressee),
  originator = upper(originator),
  aircraft_identification = upper(aircraft_identification),
  type_of_aircraft = upper(type_of_aircraft),
  departure_aerodrome = upper(departure_aerodrome),
  destination_aerodrome = upper(destination_aerodrome),
  first_alternate_aerodrome = upper(first_alternate_aerodrome),
  second_alternate_aerodrome = upper(second_alternate_aerodrome),
  cruising_speed = upper(cruising_speed),
  cruising_level = upper(cruising_level),
  route = (select coalesce(array_agg(upper(segment) order by ordinality), '{}')
           from unnest(route) with ordinality as r(segment, ordinality)),
  other_remarks = upper(other_remarks),
  dinghies_color = upper(dinghies_color),
  aircraft_color_and_marking = upper(aircraft_color_and_marking),
  remarks = upper(remarks),
  pilot_in_command_name = upper(pilot_in_command_name),
  pilot_name = upper(pilot_name),
  authorized_representative_name = upper(authorized_representative_name);

update public.weight_balances
set
  prepared_by_name = upper(prepared_by_name),
  verified_by_name = upper(verified_by_name);
