alter table public.profiles
  add column if not exists signature_svg text;

alter table public.instructor_profiles
  add column if not exists passcode_hash text;

grant update on public.instructor_profiles to authenticated;

create policy "Instructors can update own instructor profile"
on public.instructor_profiles
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);
