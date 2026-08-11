-- Centralize account approval into a single account_requests table so both
-- students and instructors submit the same verification details and pass
-- through the same review gate. Replaces the approval/document columns that
-- previously lived on student_profiles.

create table public.account_requests (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  request_type public.app_role not null,
  approval_status public.approval_status not null default 'pending',
  approved_at timestamp with time zone,
  approved_by uuid references public.profiles(id),
  rejected_at timestamp with time zone,
  rejected_by uuid references public.profiles(id),
  rejection_reason text,
  id_number text,
  id_document_path text,
  id_document_content_type text,
  id_document_size_bytes integer,
  id_document_uploaded_at timestamp with time zone,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint account_requests_request_type_check check (
    request_type in ('student', 'instructor')
  ),
  constraint account_requests_approval_state_consistent check (
    (approval_status = 'pending' and approved_at is null and rejected_at is null)
    or (approval_status = 'approved' and approved_at is not null and rejected_at is null)
    or (approval_status = 'rejected' and approved_at is null and rejected_at is not null)
  ),
  constraint account_requests_document_content_type_check check (
    id_document_content_type is null
    or id_document_content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint account_requests_document_size_check check (
    id_document_size_bytes is null
    or (id_document_size_bytes > 0 and id_document_size_bytes <= 5242880)
  ),
  constraint account_requests_submission_complete_check check (
    submitted_at is null
    or (
      id_number is not null
      and id_document_path is not null
      and id_document_content_type is not null
      and id_document_size_bytes is not null
      and id_document_uploaded_at is not null
    )
  )
);

create index account_requests_review_queue_idx
  on public.account_requests(request_type, approval_status, submitted_at desc);

create unique index account_requests_id_number_key
  on public.account_requests(request_type, id_number)
  where id_number is not null;

alter table public.account_requests enable row level security;

grant select on public.account_requests to authenticated;
grant select, insert, update, delete on public.account_requests to service_role;

create trigger account_requests_set_updated_at
  before update on public.account_requests
  for each row execute function public.set_updated_at();

create policy "Users can read own account request"
on public.account_requests
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Approved staff can read account requests"
on public.account_requests
for select
to authenticated
using (private.current_user_can_approve_students());

-- Drop the approval/document columns and the policies that only served them.

drop policy if exists "Staff can approve students" on public.student_profiles;
drop policy if exists "Approved instructors and superadmins can read student approval profiles" on public.student_profiles;

alter table public.student_profiles
  drop column if exists approval_status,
  drop column if exists approved_at,
  drop column if exists approved_by,
  drop column if exists rejected_at,
  drop column if exists rejected_by,
  drop column if exists rejection_reason,
  drop column if exists student_id_number,
  drop column if exists id_document_path,
  drop column if exists id_document_content_type,
  drop column if exists id_document_size_bytes,
  drop column if exists id_document_uploaded_at,
  drop column if exists submitted_at;

drop function if exists private.current_user_student_approval_status();

-- Approval now hinges on account_requests for both gated roles.

create or replace function private.current_user_is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    case
      when profiles.role in ('student', 'instructor') then exists (
        select 1
        from public.account_requests
        where account_requests.profile_id = profiles.id
          and account_requests.approval_status = 'approved'
      )
      else true
    end,
    false
  )
  from public.profiles
  where profiles.id = (select auth.uid())
$$;

-- New signups for gated roles start with a pending account request. This
-- definition also stops referencing the profile license columns dropped in
-- 20260802033414, which the previous definition still inserted into.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
  requested_department public.admin_department;
begin
  requested_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'requested_role', ''),
    'student'
  )::public.app_role;
  requested_department := nullif(new.raw_user_meta_data ->> 'admin_department', '')::public.admin_department;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    requested_role
  );

  if requested_role = 'student' then
    insert into public.student_profiles (profile_id) values (new.id);
    insert into public.account_requests (profile_id, request_type) values (new.id, 'student');
  elsif requested_role = 'admin' then
    insert into public.admin_profiles (profile_id, department) values (new.id, requested_department);
  elsif requested_role = 'instructor' then
    insert into public.instructor_profiles (profile_id) values (new.id);
    insert into private.instructor_credentials (profile_id) values (new.id);
    insert into public.account_requests (profile_id, request_type) values (new.id, 'instructor');
  end if;

  return new;
end;
$$;

-- The student-documents bucket is fully replaced by the centralized
-- account-documents bucket below.

drop policy if exists "Students can upload own ID documents" on storage.objects;
drop policy if exists "Students can read own ID documents" on storage.objects;

delete from storage.objects where bucket_id = 'student-documents';
delete from storage.buckets where id = 'student-documents';

-- Centralized bucket for all account verification documents.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'account-documents',
  'account-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users can upload own account documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'account-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can read own account documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'account-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
