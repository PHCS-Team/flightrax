-- Certificates get a dedicated required title; description becomes an
-- optional free-text field.

alter table public.certificates
  add column if not exists title text;

update public.certificates
set title = description
where title is null;

alter table public.certificates
  alter column title set not null;

alter table public.certificates
  add constraint certificates_title_not_blank check (btrim(title) <> '');

alter table public.certificates
  alter column description drop not null;
