-- Two legend types carry no people: OTS (out of service) and TBD (to be
-- determined). Every other type is a session for somebody. The form shows
-- either the pilot/instructor pair or a note depending on the type; the
-- constraint keeps the data honest either way.

alter table public.schedule_entries
  drop constraint schedule_entries_people_check;

alter table public.schedule_entries
  add constraint schedule_entries_people_check check (
    case
      when session_type in ('ots', 'tbd')
        then pilot_profile_id is null and instructor_profile_id is null
      else pilot_profile_id is not null or instructor_profile_id is not null
    end
  );
