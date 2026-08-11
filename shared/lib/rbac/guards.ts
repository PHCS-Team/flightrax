import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export function isApproved(profile: Profile | null) {
  return profile?.approval_status === APPROVAL_STATUS.APPROVED;
}
