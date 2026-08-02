-- Licenses: a single license can carry multiple ratings, and some licenses
-- never expire. The old single `rating` text column becomes `ratings text[]`.

alter table public.licenses
  drop constraint if exists licenses_rating_not_blank;

-- Preserve any existing single rating as the first element of the array.
alter table public.licenses
  alter column rating type text[] using (
    case when rating is null then array[]::text[] else array[rating] end
  );

alter table public.licenses
  rename column rating to ratings;

alter table public.licenses
  alter column ratings set default '{}'::text[];

alter table public.licenses
  alter column ratings set not null;

-- Licenses without an expiry date (e.g. flight instructor licenses).
alter table public.licenses
  add column if not exists has_no_expiry boolean not null default false;
