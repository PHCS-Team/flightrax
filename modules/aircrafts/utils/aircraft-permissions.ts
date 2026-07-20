import { ADMIN_DEPARTMENT, ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import type { Profile } from "@/shared/lib/rbac/types";

export function canManageAircrafts(profile: Profile | null) {
  if (!profile) {
    return false;
  }

  if (!isApproved(profile)) {
    return false;
  }

  if (profile.role === ROLE.SUPERADMIN || profile.role === ROLE.INSTRUCTOR) {
    return true;
  }

  return (
    profile.role === ROLE.ADMIN &&
    profile.admin_department === ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL
  );
}
