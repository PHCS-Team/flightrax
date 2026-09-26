-- Global app settings: one row per key, jsonb value. Reads are open to
-- authenticated users; writes go through the service role only (no
-- insert/update/delete policies), so only superadmin-guarded server
-- code can change them.
--
-- superadmin_full_navigation: when false, superadmins see and reach
-- only Home and the Users pages; when true they get every nav and route.

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "Authenticated users can read settings"
on public.app_settings
for select
to authenticated
using (true);

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (key, value)
values ('superadmin_full_navigation', 'false'::jsonb);
