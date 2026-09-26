-- The printed form's pilot name/signature/license column belongs to the
-- pilot in command, not the filer. New saves snapshot the PIC; this
-- backfills plans where someone else was set as PIC, replacing the
-- filer's snapshot with the PIC's registered signature and licenses.

update public.flight_plans fp
set
  pilot_signature = p.signature_svg,
  pilot_licenses = coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'licenseType', l.license_type,
          'licenseNumber', l.license_number,
          'ratings', to_jsonb(l.ratings),
          'expiryDate', l.expiry_date,
          'hasNoExpiry', l.has_no_expiry,
          'status', l.status
        )
      )
      from public.licenses l
      where l.user_id = fp.pilot_in_command_id
    ),
    '[]'::jsonb
  )
from public.profiles p
where p.id = fp.pilot_in_command_id
  and fp.pilot_in_command_id is not null
  and fp.pilot_in_command_id <> fp.created_by;
