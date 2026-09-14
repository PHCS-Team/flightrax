-- One file per date. Two workbooks covering the same day would show two
-- bars on the calendar and leave the student guessing which one is the
-- schedule, so an overlapping range is rejected at insert. A revision
-- means removing the old file first, then uploading the new one.

alter table public.schedule_uploads
  add constraint schedule_uploads_no_overlap exclude using gist (
    daterange(starts_on, ends_on, '[]') with &&
  );
