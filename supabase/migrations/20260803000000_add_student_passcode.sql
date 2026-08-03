alter table public.student_profiles
  add column if not exists passcode_hash text;

-- Own-row update would otherwise let a student flip their own approval_status.

create policy "Students can update own student profile"
on public.student_profiles
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create or replace function private.protect_student_approval_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.profile_id then
    if new.approval_status is distinct from old.approval_status
      or new.approved_at is distinct from old.approved_at
      or new.approved_by is distinct from old.approved_by
      or new.rejected_at is distinct from old.rejected_at
      or new.rejected_by is distinct from old.rejected_by
      or new.rejection_reason is distinct from old.rejection_reason
      or new.submitted_at is distinct from old.submitted_at
      or new.student_id_number is distinct from old.student_id_number
      or new.id_document_path is distinct from old.id_document_path
      or new.id_document_content_type is distinct from old.id_document_content_type
      or new.id_document_size_bytes is distinct from old.id_document_size_bytes
      or new.id_document_uploaded_at is distinct from old.id_document_uploaded_at
      or new.profile_id is distinct from old.profile_id then
      raise exception 'Students can only update their passcode.';
    end if;
  end if;

  return new;
end;
$$;

create trigger student_profiles_protect_approval_fields
  before update on public.student_profiles
  for each row execute function private.protect_student_approval_fields();
