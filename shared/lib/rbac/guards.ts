import { APPROVAL_STATUS, ROLE, hasPermission } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export function isApproved(profile: Profile | null) {
  return profile?.approval_status === APPROVAL_STATUS.APPROVED;
}

export function canApproveStudent(actor: Profile | null, target: Profile | null) {
  if (!actor || !target || target.role !== ROLE.STUDENT || actor.id === target.id) {
    return false;
  }

  return isApproved(actor) && hasPermission(actor.role, "students.approve", actor.admin_department);
}
