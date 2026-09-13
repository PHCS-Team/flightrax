-- Board rows belong to a day. The paper board is one sheet per date, and
-- which aircraft appear on it changes daily — a row added for the 12th
-- must not show on the 13th. Entries inherit the day from their row.

alter table public.schedule_resources
  add column board_date date not null
    default (timezone('Asia/Manila', now()))::date;

alter table public.schedule_resources
  alter column board_date drop default;

-- Uniqueness is now per day, not global.
alter table public.schedule_resources
  drop constraint schedule_resources_display_name_key;

alter table public.schedule_resources
  add constraint schedule_resources_board_date_display_name_key
    unique (board_date, display_name);

drop index public.schedule_resources_aircraft_id_key;

create unique index schedule_resources_board_date_aircraft_id_key
  on public.schedule_resources (board_date, aircraft_id)
  where aircraft_id is not null;

drop index public.schedule_resources_sort_idx;

create index schedule_resources_board_idx
  on public.schedule_resources (board_date, is_active, sort_order);
