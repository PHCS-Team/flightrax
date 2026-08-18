-- Weight & balance configs gain per-station arms and a maximum takeoff
-- weight. The old generic arm/moment pair becomes the basic-empty-weight
-- station; renaming the columns preserves existing values.

alter table public.aircraft_weight_balance_configs
  rename column arm to basic_empty_weight_arm;

alter table public.aircraft_weight_balance_configs
  rename column moment to basic_empty_weight_moment;

-- Keep the existing check constraints named after the renamed columns.
alter table public.aircraft_weight_balance_configs
  rename constraint aircraft_weight_balance_configs_arm_check
  to aircraft_weight_balance_configs_basic_empty_weight_arm_check;

alter table public.aircraft_weight_balance_configs
  rename constraint aircraft_weight_balance_configs_moment_check
  to aircraft_weight_balance_configs_basic_empty_weight_moment_check;

-- New required columns arrive nullable first so rows created before this
-- migration survive it, then get backfilled and locked down. The backfill
-- values are placeholders taken from the basic empty weight figures; staff
-- re-enter the real numbers through the weight & balance dialog.
alter table public.aircraft_weight_balance_configs
  add column if not exists usable_fuel_arm numeric(10,2),
  add column if not exists fi_and_student_arm numeric(10,2),
  add column if not exists primary_baggage_area_arm numeric(10,2) not null default 0,
  add column if not exists secondary_baggage_area_arm numeric(10,2) not null default 0,
  add column if not exists maximum_takeoff_weight numeric(10,2);

update public.aircraft_weight_balance_configs
set
  usable_fuel_arm = coalesce(usable_fuel_arm, basic_empty_weight_arm),
  fi_and_student_arm = coalesce(fi_and_student_arm, basic_empty_weight_arm),
  maximum_takeoff_weight = coalesce(maximum_takeoff_weight, basic_empty_weight);

alter table public.aircraft_weight_balance_configs
  alter column usable_fuel_arm set not null,
  alter column fi_and_student_arm set not null,
  alter column maximum_takeoff_weight set not null;

alter table public.aircraft_weight_balance_configs
  add constraint aircraft_weight_balance_configs_usable_fuel_arm_check
    check (usable_fuel_arm > 0),
  add constraint aircraft_weight_balance_configs_fi_and_student_arm_check
    check (fi_and_student_arm > 0),
  add constraint aircraft_weight_balance_configs_maximum_takeoff_weight_check
    check (maximum_takeoff_weight > 0);
