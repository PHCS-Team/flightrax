import type { LicenseValidityInput } from "@/shared/lib/aviation/license-validity";
import { isLicenseValid } from "@/shared/lib/aviation/license-validity";
import { ROLE } from "@/shared/lib/rbac/config";
import type { Database } from "@/shared/types/supabase";

type AppRole = Database["public"]["Enums"]["app_role"];

const PPL_LICENSE_TYPE = "private_pilot_license";

export function isInstructorRole(role: AppRole): boolean {
  return role === ROLE.INSTRUCTOR || role === ROLE.SUPERADMIN;
}

// Who may act as pilot in command — and, by the client's rule, approve or
// reject a request they are PIC on: an instructor with any valid license,
// or a student holding a valid PPL.
export function canCommandAsPic(
  role: AppRole,
  licenses: readonly (LicenseValidityInput & { license_type: string })[],
): boolean {
  if (isInstructorRole(role)) {
    return licenses.some((license) => isLicenseValid(license));
  }

  return licenses.some(
    (license) =>
      license.license_type === PPL_LICENSE_TYPE && isLicenseValid(license),
  );
}

// Approval rule: the assigned instructor always may; the PIC may when
// they are eligible to command (see canCommandAsPic). A student PIC
// without a valid PPL never approves their own flight.
export function canActOnFlightRequest({
  viewerId,
  viewerCanCommandAsPic,
  pilotInCommandId,
  instructorProfileId,
}: {
  viewerId: string;
  viewerCanCommandAsPic: boolean;
  pilotInCommandId: string | null;
  instructorProfileId: string | null;
}): boolean {
  if (instructorProfileId !== null && instructorProfileId === viewerId) {
    return true;
  }

  return pilotInCommandId === viewerId && viewerCanCommandAsPic;
}
