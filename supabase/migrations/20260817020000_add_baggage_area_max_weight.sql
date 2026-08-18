-- Types with baggage areas also carry a structural baggage weight limit
-- from the POH. 0 means the type has no baggage allowance (no areas).

alter table public.aircraft_types
  add column baggage_area_max_weight numeric(10,2) not null default 0;

alter table public.aircraft_types
  add constraint aircraft_types_baggage_area_max_weight_check
    check (baggage_area_max_weight >= 0);
