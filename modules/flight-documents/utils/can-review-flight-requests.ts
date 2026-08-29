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
