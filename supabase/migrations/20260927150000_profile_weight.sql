-- Bodyweight on the profile, informational only (no W&B math reads it).
-- The owner may type it in kilograms or pounds, but the column stores the
-- canonical pounds value, matching the unit used across the app.

alter table public.profiles
  add column weight_lbs numeric(6, 2),
  add constraint profiles_weight_lbs_range check (
    weight_lbs is null
    or (weight_lbs > 0 and weight_lbs <= 1100)
  );
