-- ARMs are measured from each aircraft type's datum, and a station forward
-- of the datum has a negative ARM. The Tecnam P2006T's datum is the wing
-- leading edge, so its front seats sit at -2.973 ft (-35.68 in) and the
-- FI + student moment is negative as well. Every ARM and moment was
-- constrained to be positive, which made that aircraft impossible to
-- configure correctly.
--
-- Weights keep their positive checks. ARMs and moments may take any sign;
-- the application still requires a value for each one.

alter table public.aircraft_types
  drop constraint if exists aircraft_types_usable_fuel_arm_check;

alter table public.aircraft_types
  drop constraint if exists aircraft_types_fi_and_student_arm_check;

alter table public.aircraft_type_baggage_areas
  drop constraint if exists aircraft_type_baggage_areas_arm_check;

alter table public.aircraft_weight_balance_configs
  drop constraint if exists aircraft_weight_balance_configs_basic_empty_weight_arm_check;

alter table public.aircraft_weight_balance_configs
  drop constraint if exists aircraft_weight_balance_configs_basic_empty_weight_moment_check;
