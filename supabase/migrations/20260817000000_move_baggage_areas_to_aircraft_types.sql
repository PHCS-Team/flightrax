-- Baggage areas are a property of the aircraft type, not the individual
-- aircraft, and a type can have zero, one, two, or more of them. The fixed
-- primary/secondary columns on aircraft_weight_balance_configs cannot model
-- that, so baggage areas move to a child table of aircraft_types.

create table public.aircraft_type_baggage_areas (
  id uuid primary key default gen_random_uuid(),
  aircraft_type_key text not null
    references public.aircraft_types(type_key) on delete cascade,
  position smallint not null,
  arm numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aircraft_type_baggage_areas_position_check check (position > 0),
  constraint aircraft_type_baggage_areas_arm_check check (arm > 0),
  constraint aircraft_type_baggage_areas_type_position_key
    unique (aircraft_type_key, position)
);

alter table public.aircraft_type_baggage_areas enable row level security;

grant select, insert, update, delete on public.aircraft_type_baggage_areas to authenticated;
grant select, insert, update, delete on public.aircraft_type_baggage_areas to service_role;

create trigger aircraft_type_baggage_areas_set_updated_at
  before update on public.aircraft_type_baggage_areas
  for each row execute function public.set_updated_at();

create policy "Approved users can read aircraft type baggage areas"
on public.aircraft_type_baggage_areas
for select
to authenticated
using (private.current_user_is_approved());

create policy "Flight operations staff can create aircraft type baggage areas"
on public.aircraft_type_baggage_areas
for insert
to authenticated
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can update aircraft type baggage areas"
on public.aircraft_type_baggage_areas
for update
to authenticated
using (private.current_user_can_manage_aircrafts())
with check (private.current_user_can_manage_aircrafts());

create policy "Flight operations staff can delete aircraft type baggage areas"
on public.aircraft_type_baggage_areas
for delete
to authenticated
using (private.current_user_can_manage_aircrafts());

-- Preserve any baggage arms already captured: for each type, carry over the
-- most recently updated aircraft config's non-zero baggage arms (0 was the
-- old "not applicable" sentinel, so zeros become "no baggage area").
with latest_config_per_type as (
  select distinct on (aircrafts.aircraft_type)
    aircrafts.aircraft_type as type_key,
    configs.primary_baggage_area_arm,
    configs.secondary_baggage_area_arm
  from public.aircraft_weight_balance_configs configs
  join public.aircrafts on aircrafts.id = configs.aircraft_id
  order by aircrafts.aircraft_type, configs.updated_at desc
)
insert into public.aircraft_type_baggage_areas (aircraft_type_key, position, arm)
select type_key, 1, primary_baggage_area_arm
from latest_config_per_type
where primary_baggage_area_arm > 0
union all
select type_key, 2, secondary_baggage_area_arm
from latest_config_per_type
where secondary_baggage_area_arm > 0;

alter table public.aircraft_weight_balance_configs
  drop column primary_baggage_area_arm,
  drop column secondary_baggage_area_arm;
