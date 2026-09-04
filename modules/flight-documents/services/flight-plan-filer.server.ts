import "server-only";

import type {
  FlightPlanFilerContext,
  FlightPlanPicOption,
} from "@/modules/flight-documents/types/filer-context";
import {
  canCommandAsPic,
  isInstructorRole,
} from "@/modules/flight-documents/utils/flight-request-eligibility";
import { isLicenseValid } from "@/shared/lib/aviation/license-validity";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

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
  const canSetSelfAsPic = canCommandAsPic(viewer.role, licenses ?? []);

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

  const instructorIds = (data ?? []).map((row) => row.profiles.id);
  const today = new Date().toISOString().slice(0, 10);
  const { data: unavailabilityRows, error: unavailabilityError } =
    instructorIds.length > 0
      ? await supabase
          .from("instructor_unavailabilities")
          .select("instructor_profile_id, starts_on, ends_on")
          .in("instructor_profile_id", instructorIds)
          .gte("ends_on", today)
          .order("starts_on", { ascending: true })
      : { data: [], error: null };

  if (unavailabilityError) {
    throw new Error(unavailabilityError.message);
  }

  const unavailabilitiesByProfile = new Map<
    string,
    { startsOn: string; endsOn: string }[]
  >();

  for (const row of unavailabilityRows ?? []) {
    const entries =
      unavailabilitiesByProfile.get(row.instructor_profile_id) ?? [];
    entries.push({ startsOn: row.starts_on, endsOn: row.ends_on });
    unavailabilitiesByProfile.set(row.instructor_profile_id, entries);
  }

  return (data ?? [])
    .map((row) => ({
      id: row.profiles.id,
      fullName: row.profiles.full_name,
      unavailabilities: unavailabilitiesByProfile.get(row.profiles.id) ?? [],
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function isInstructorProfile(profileId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? isInstructorRole(data.role) : false;
}

export async function getPicUnavailabilityEndsOn(
  picId: string,
  zuluDate: string,
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("instructor_unavailabilities")
    .select("ends_on")
    .eq("instructor_profile_id", picId)
    .lte("starts_on", zuluDate)
    .gte("ends_on", zuluDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.ends_on ?? null;
}
