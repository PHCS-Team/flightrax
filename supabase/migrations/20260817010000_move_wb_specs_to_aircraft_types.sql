-- Usable fuel arm, FI + student arm, and MTOW are POH/type-certificate
-- constants of the aircraft model, not per-airframe measurements, so they
-- move from aircraft_weight_balance_configs to aircraft_types. The
-- per-aircraft config keeps only what weighing produces: basic empty
-- weight, its arm, and its moment.

alter table public.aircraft_types
  add column usable_fuel_arm numeric(10,2),
  add column fi_and_student_arm numeric(10,2),
  add column maximum_takeoff_weight numeric(10,2);

alter table public.aircraft_types
  add constraint aircraft_types_usable_fuel_arm_check
    check (usable_fuel_arm is null or usable_fuel_arm > 0),
  add constraint aircraft_types_fi_and_student_arm_check
    check (fi_and_student_arm is null or fi_and_student_arm > 0),
  add constraint aircraft_types_maximum_takeoff_weight_check
    check (maximum_takeoff_weight is null or maximum_takeoff_weight > 0);

-- Preserve captured values: carry over each type's specs from its most
-- recently updated aircraft config.
with latest_config_per_type as (
  select distinct on (aircrafts.aircraft_type)
    aircrafts.aircraft_type as type_key,
    configs.usable_fuel_arm,
    configs.fi_and_student_arm,
    configs.maximum_takeoff_weight
  from public.aircraft_weight_balance_configs configs
  join public.aircrafts on aircrafts.id = configs.aircraft_id
  order by aircrafts.aircraft_type, configs.updated_at desc
)
update public.aircraft_types
set
  usable_fuel_arm = latest.usable_fuel_arm,
  fi_and_student_arm = latest.fi_and_student_arm,
  maximum_takeoff_weight = latest.maximum_takeoff_weight
from latest_config_per_type latest
where aircraft_types.type_key = latest.type_key;

alter table public.aircraft_weight_balance_configs
  drop column usable_fuel_arm,
  drop column fi_and_student_arm,
  drop column maximum_takeoff_weight;
