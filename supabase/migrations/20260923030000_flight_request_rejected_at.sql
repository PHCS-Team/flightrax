-- Rejections recorded who rejected a request but not when, so the audit
-- trail could not say it. Approvals already carry approved_at.
alter table public.flight_requests
  add column rejected_at timestamptz;

-- Existing rejections predate the column; updated_at is the closest record
-- of when the rejection happened, since a rejected row is not touched again
-- until it is resubmitted.
update public.flight_requests
set rejected_at = updated_at
where rejected_by is not null
  and rejected_at is null;
