-- Certificates gain the same expiry tracking licenses have: an optional
-- expiry date plus a no-expiry flag.

alter table public.certificates
  add column if not exists expiry_date date,
  add column if not exists has_no_expiry boolean not null default false;
