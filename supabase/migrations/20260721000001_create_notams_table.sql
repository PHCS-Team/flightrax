create table public.notams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'general',
  severity text not null default 'advisory'
    check (severity in ('advisory', 'warning', 'alert')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notams enable row level security;

create policy "Authenticated users can read notams"
  on public.notams
  for select
  to authenticated
  using (true);

grant select on public.notams to authenticated;
