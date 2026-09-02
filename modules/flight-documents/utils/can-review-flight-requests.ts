import { ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

// Reviewers may see the flight request review queue and open other
// pilots' flight plans read-only. Reviewing is an instructor's job —
// admins don't take part, and superadmins can do everything.
export function canReviewFlightRequests(
  profile: Pick<Profile, "role"> | null,
): boolean {
  return (
    profile?.role === ROLE.INSTRUCTOR || profile?.role === ROLE.SUPERADMIN
  );
}

// Admins may READ any flight record for auditing (plans, W&B,
// journeys) but never take part in reviewing — reviewing stays with
// instructors and superadmins.
export function canViewFlightDocumentRecords(
  profile: Pick<Profile, "role"> | null,
): boolean {
  return canReviewFlightRequests(profile) || profile?.role === ROLE.ADMIN;
}
