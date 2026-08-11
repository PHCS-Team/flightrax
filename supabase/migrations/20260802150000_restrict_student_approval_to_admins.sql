-- Restrict student approval to admins and superadmins only (remove instructors)
-- Matches permission change: instructors can view students but no longer approve/reject them.

create or replace function private.current_user_can_approve_students()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'superadmin')
      and private.current_user_is_approved()
  )
$$;

grant execute on function private.current_user_can_approve_students() to authenticated;