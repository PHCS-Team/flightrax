insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-documents',
  'student-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.student_profiles
  add column if not exists student_id_number text,
  add column if not exists id_document_path text,
  add column if not exists id_document_content_type text,
  add column if not exists id_document_size_bytes integer,
  add column if not exists id_document_uploaded_at timestamptz,
  add column if not exists submitted_at timestamptz;

create unique index if not exists student_profiles_student_id_number_key
on public.student_profiles(student_id_number)
where student_id_number is not null;

create index if not exists student_profiles_submitted_at_idx
on public.student_profiles(submitted_at)
where submitted_at is not null;

create index if not exists student_profiles_review_queue_idx
on public.student_profiles(approval_status, submitted_at)
where submitted_at is not null;

alter table public.student_profiles
  drop constraint if exists student_profiles_id_document_content_type_check,
  add constraint student_profiles_id_document_content_type_check check (
    id_document_content_type is null
    or id_document_content_type in ('image/jpeg', 'image/png', 'image/webp')
  );

alter table public.student_profiles
  drop constraint if exists student_profiles_id_document_size_bytes_check,
  add constraint student_profiles_id_document_size_bytes_check check (
    id_document_size_bytes is null
    or (id_document_size_bytes > 0 and id_document_size_bytes <= 5242880)
  );

alter table public.student_profiles
  drop constraint if exists student_profiles_submission_complete_check,
  add constraint student_profiles_submission_complete_check check (
    submitted_at is null
    or (
      student_id_number is not null
      and id_document_path is not null
      and id_document_content_type is not null
      and id_document_size_bytes is not null
      and id_document_uploaded_at is not null
    )
  );

drop policy if exists "Students can upload own ID documents" on storage.objects;
drop policy if exists "Students can read own ID documents" on storage.objects;

create policy "Students can upload own ID documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Students can read own ID documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
