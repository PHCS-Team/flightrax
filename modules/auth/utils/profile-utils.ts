import {
  getLicenseTypeLabel,
  getRatingLabel,
} from "@/shared/lib/aviation/license-options";
import { ADMIN_DEPARTMENT_LABELS } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export function getProfileDetails(profile: Profile) {
  return [
    {
      icon: "licenseType" as const,
      label: "License type",
      value:
        getLicenseTypeLabel(profile.license_type) ??
        profile.license_type ??
        "Pending submission",
    },
    {
      icon: "licenseNumber" as const,
      label: "License number",
      value: profile.license_number ?? "Pending submission",
    },
    {
      icon: "rating" as const,
      label: "Rating",
      value:
        getRatingLabel(profile.rating) ??
        profile.rating ??
        "Pending submission",
    },
  ];
}

export function getAdminDepartmentLabel(profile: Profile) {
  if (!profile.admin_department) {
    return "Department not assigned";
  }

  return ADMIN_DEPARTMENT_LABELS[profile.admin_department];
}
