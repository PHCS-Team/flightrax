import { FLIGHT_PLANS_VIEW } from "@/modules/flight-documents/constants/permissions";
import { hasPermission, ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export function canReviewFlightRequests(
  profile: Pick<Profile, "role"> | null,
): boolean {
  return profile?.role === ROLE.INSTRUCTOR || profile?.role === ROLE.SUPERADMIN;
}

export function canViewFlightDocumentRecords(
  profile: Pick<Profile, "admin_department" | "role"> | null,
): boolean {
  if (!profile) {
    return false;
  }

  return (
    canReviewFlightRequests(profile) ||
    hasPermission(profile.role, FLIGHT_PLANS_VIEW, profile.admin_department)
  );
}
