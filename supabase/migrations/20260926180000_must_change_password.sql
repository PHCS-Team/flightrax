-- Seeded accounts start on a known default password. The flag makes the
-- app nag the owner into setting their own: the seeder turns it on, the
-- change-password action turns it off.

alter table public.profiles
  add column must_change_password boolean not null default false;
