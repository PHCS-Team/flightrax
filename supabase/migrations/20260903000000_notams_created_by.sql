-- Every NOTAM is traceable to the admin who posted it. Nullable so the
-- rows that already exist keep working; the app always sets it.
alter table public.notams
  add column created_by uuid references public.profiles(id);

create index notams_expires_at_idx on public.notams (expires_at);
