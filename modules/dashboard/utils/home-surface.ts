import { ADMIN_DEPARTMENT, ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

export type DashboardHomeSurface =
  | "flight-board"
  | "organized-board"
  | "aircrafts";

export function getDashboardHomeSurface(
  profile: Pick<Profile, "admin_department" | "role"> | null,
): DashboardHomeSurface {
  if (profile?.role !== ROLE.ADMIN) {
    return "flight-board";
  }

  if (
    profile.admin_department === ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL
  ) {
    return "aircrafts";
  }

  return "organized-board";
}
