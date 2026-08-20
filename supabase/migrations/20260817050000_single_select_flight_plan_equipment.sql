-- COM/NAV and surveillance equipment are single choices on the form, not
-- multi-selects — store them as single text codes. Existing array values
-- keep their first element; empty arrays fall back to the form defaults
-- (S for COM/NAV, C for surveillance).

alter table public.flight_plans
  drop constraint flight_plans_com_nav_equipment_check,
  drop constraint flight_plans_surveillance_equipment_check;

alter table public.flight_plans
  alter column com_nav_equipment drop default,
  alter column surveillance_equipment drop default;

alter table public.flight_plans
  alter column com_nav_equipment type text
    using coalesce(com_nav_equipment[1], 'S'),
  alter column surveillance_equipment type text
    using coalesce(surveillance_equipment[1], 'C');

alter table public.flight_plans
  alter column com_nav_equipment set default 'S',
  alter column surveillance_equipment set default 'C';

alter table public.flight_plans
  add constraint flight_plans_com_nav_equipment_check
    check (com_nav_equipment in ('N', 'S')),
  add constraint flight_plans_surveillance_equipment_check
    check (surveillance_equipment in ('N', 'A', 'C'));
