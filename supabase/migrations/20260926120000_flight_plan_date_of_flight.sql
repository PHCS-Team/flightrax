-- Separate the date of flight (Item 18 DOF/, ICAO YYMMDD) from the date
-- of filing (the existing dof_raw DDHHMM). Nullable so existing rows are
-- untouched structurally; backfilled with the local (Asia/Manila) date
-- the filing DOF resolved to, which is exactly what availability and
-- journey scheduling assumed until now.

alter table public.flight_plans
  add column date_of_flight_raw text,
  add column date_of_flight_resolved date;

update public.flight_plans
set
  date_of_flight_resolved = (dof_resolved at time zone 'Asia/Manila')::date,
  date_of_flight_raw = to_char(
    (dof_resolved at time zone 'Asia/Manila')::date,
    'YYMMDD'
  )
where dof_resolved is not null;
