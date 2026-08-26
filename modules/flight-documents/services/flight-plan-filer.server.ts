import "server-only";

import type {
  FlightPlanFilerContext,
  FlightPlanPicOption,
} from "@/modules/flight-documents/types/filer-context";
import type { LicenseTypeValue } from "@/shared/lib/aviation/license-options";
import { isLicenseValid } from "@/shared/lib/aviation/license-validity";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const PPL_LICENSE_TYPE: LicenseTypeValue = "private_pilot_license";

export async function getFlightPlanFilerContext(): Promise<FlightPlanFilerContext> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to file flight plans.");
  }

  const supabase = createAdminClient();
  const { data: licenses, error } = await supabase
    .from("licenses")
    .select(
      "license_type, license_number, ratings, expiry_date, has_no_expiry, status",
    )
    .eq("user_id", viewer.id);

  if (error) {
    throw new Error(error.message);
  }

  const hasValidLicense = (licenses ?? []).some((license) =>
    isLicenseValid(license),
  );
  const canSetSelfAsPic = (licenses ?? []).some(
    (license) =>
      license.license_type === PPL_LICENSE_TYPE && isLicenseValid(license),
  );

  return {
    profile: {
      id: viewer.id,
      fullName: viewer.full_name,
      role: viewer.role,
    },
    licenses: (licenses ?? []).map((license) => ({
      licenseType: license.license_type,
      licenseNumber: license.license_number,
      ratings: license.ratings,
      expiryDate: license.expiry_date,
      hasNoExpiry: license.has_no_expiry,
      status: license.status,
    })),
    hasSignature: Boolean(viewer.signature_svg?.trim()),
    hasValidLicense,
    canSetSelfAsPic,
  };
}

export async function getFlightPlanPicOptions(): Promise<
  FlightPlanPicOption[]
> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to file flight plans.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("account_requests")
    .select(
      "profile_id, profiles!account_requests_profile_id_fkey(id, full_name)",
    )
    .eq("request_type", "instructor")
    .eq("approval_status", "approved");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => ({
      id: row.profiles.id,
      fullName: row.profiles.full_name,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
