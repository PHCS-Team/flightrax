-- Centralize the security passcode on profiles. Any passcode-enabled role
-- (students and instructors today) now shares the single nullable column,
-- written through the service-role client like signature_svg.

alter table public.profiles
  add column if not exists passcode_hash text;

update public.profiles p
set passcode_hash = sp.passcode_hash
from public.student_profiles sp
where sp.profile_id = p.id
  and sp.passcode_hash is not null;

update public.profiles p
set passcode_hash = ip.passcode_hash
from public.instructor_profiles ip
where ip.profile_id = p.id
  and ip.passcode_hash is not null;

-- The role-table self-update policies and the approval-field guard existed
-- only so users could write their own passcode_hash; drop them with the columns.

drop trigger if exists student_profiles_protect_approval_fields on public.student_profiles;
drop function if exists private.protect_student_approval_fields();
drop policy if exists "Students can update own student profile" on public.student_profiles;
drop policy if exists "Instructors can update own instructor profile" on public.instructor_profiles;
revoke update on public.instructor_profiles from authenticated;

alter table public.student_profiles
  drop column if exists passcode_hash;

alter table public.instructor_profiles
  drop column if exists passcode_hash;
