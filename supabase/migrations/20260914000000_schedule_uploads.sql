-- Uploaded schedule workbooks: the Excel file the school already produces,
-- posted as-is next to the hand-built day board.
--
-- The admin uploads one workbook and says which dates it covers (a week's
-- file has one sheet per weekday, a single-day file has one sheet). The
-- month calendar paints every date in that range; opening a date opens the
-- workbook. Two tables:
--
--   schedule_uploads        one row per file — the range it covers, who
--                           posted it, and where the original lives in the
--                           schedule-files bucket for download.
--   schedule_upload_sheets  one row per sheet inside that file, parsed at
--                           upload time on the server into a plain JSON grid
--                           (values, merges, fills) so the viewer renders
--                           it without shipping a spreadsheet library or
--                           re-reading the file.
--
-- Ranges may overlap. A revised file for the same week is a new upload,
-- not an edit; the newest one lists first and the old one stays until an
-- admin removes it.

-- --------------------------------------------------------------- uploads

create table public.schedule_uploads (
  id uuid primary key default gen_random_uuid(),
  -- Optional caption shown on the calendar cell: "Week 38", "Rev 2".
  label text,
  -- The workbook as the admin named it, shown on the card and used for
  -- the download filename.
  file_name text not null,
  -- Object key inside the schedule-files bucket: "<upload id>/<file>.xlsx".
  storage_path text not null,
  content_type text not null,
  size_bytes integer not null,
  -- Inclusive calendar dates (school-local) the file covers.
  starts_on date not null,
  ends_on date not null,
  sheet_count integer not null default 0,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_uploads_label_not_blank
    check (label is null or btrim(label) <> ''),
  constraint schedule_uploads_file_name_not_blank
    check (btrim(file_name) <> ''),
  constraint schedule_uploads_storage_path_key unique (storage_path),
  constraint schedule_uploads_content_type_check check (
    content_type in (
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  ),
  constraint schedule_uploads_size_bytes_check
    check (size_bytes > 0 and size_bytes <= 4194304),
  constraint schedule_uploads_range_check check (ends_on >= starts_on),
  constraint schedule_uploads_sheet_count_check check (sheet_count >= 0)
);

-- The month view asks "every upload touching [first, last] of the month":
-- starts_on <= last and ends_on >= first.
create index schedule_uploads_range_idx
  on public.schedule_uploads (starts_on, ends_on);

create index schedule_uploads_created_at_idx
  on public.schedule_uploads (created_at desc);

create trigger schedule_uploads_set_updated_at
  before update on public.schedule_uploads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- sheets

create table public.schedule_upload_sheets (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.schedule_uploads(id) on delete cascade,
  -- Tab order in the workbook, from 0.
  position integer not null,
  name text not null,
  -- Set when the sheet's tab name reads as a date inside the upload's
  -- range ("Mon", "15", "Sept 15"), so a calendar date can open straight
  -- to its sheet. Null when the parser cannot tell.
  board_date date,
  -- The parsed sheet. Shape is owned by the parser in
  -- modules/schedule/utils; roughly { rowCount, colCount, colWidths,
  -- merges: [{ r, c, rowSpan, colSpan }], cells: [{ r, c, v, fill, bold,
  -- align }] } with only non-empty cells listed.
  grid jsonb not null,
  created_at timestamptz not null default now(),
  constraint schedule_upload_sheets_position_check check (position >= 0),
  constraint schedule_upload_sheets_name_not_blank check (btrim(name) <> ''),
  constraint schedule_upload_sheets_upload_position_key unique (upload_id, position)
);

create index schedule_upload_sheets_board_date_idx
  on public.schedule_upload_sheets (board_date)
  where board_date is not null;

-- ------------------------------------------------------------------- RLS
--
-- Same as the day board: everyone signed in reads, writes go through
-- server actions guarded by SCHEDULE_MANAGE using the service role, so
-- there are no insert/update/delete policies for clients.

alter table public.schedule_uploads enable row level security;
alter table public.schedule_upload_sheets enable row level security;

create policy "Authenticated users can read schedule uploads"
  on public.schedule_uploads
  for select
  to authenticated
  using (true);

create policy "Authenticated users can read schedule upload sheets"
  on public.schedule_upload_sheets
  for select
  to authenticated
  using (true);

grant select on public.schedule_uploads to authenticated;
grant select on public.schedule_upload_sheets to authenticated;

-- --------------------------------------------------------------- storage
--
-- Private bucket for the original workbooks. .xlsx only: that is what the
-- server-side parser reads, and the same MIME type the row constraint
-- accepts. 4 MiB keeps a file inside the server action body limit on
-- Vercel (4.5 MB), which is the path every upload takes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'schedule-files',
  'schedule-files',
  false,
  4194304,
  array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read schedule files" on storage.objects;

-- Reads only. Upload and delete happen through the service role inside
-- the schedule actions, alongside the row insert, so a file and its row
-- appear and disappear together.
create policy "Authenticated users can read schedule files"
on storage.objects
for select
to authenticated
using (bucket_id = 'schedule-files');
