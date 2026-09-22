-- The school files altitudes like A0015 as well as the ICAO three-digit
-- form (A015). Allow F and A with three or four digits, so a cruising level
-- can be up to 5 characters. S and M keep their four digits.
alter table public.flight_plans
  drop constraint if exists flight_plans_cruising_level_check;

alter table public.flight_plans
  add constraint flight_plans_cruising_level_check
    check (cruising_level = 'VFR' or cruising_level ~ '^(F\d{3,4}|S\d{4}|A\d{3,4}|M\d{4})$');
