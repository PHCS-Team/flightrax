import { ADMIN_DEPARTMENT_LABELS } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export function getAdminDepartmentLabel(profile: Profile) {
  if (!profile.admin_department) {
    return "Department not assigned";
  }

  return ADMIN_DEPARTMENT_LABELS[profile.admin_department];
}
