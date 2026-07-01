import {
  BellIcon,
  CalendarClockIcon,
  FileTextIcon,
  GaugeIcon,
  GraduationCapIcon,
  PlaneIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { ADMIN_DEPARTMENT, ROLE } from "@/shared/lib/rbac/config";
import type { AdminDepartment, Profile } from "@/shared/lib/rbac/types";

export type DashboardNavigationItemId =
  | "home"
  | "flightDocuments"
  | "instructors"
  | "schedule"
  | "students"
  | "studentReview"
  | "aircrafts"
  | "notams";

export type DashboardNavigationItem = {
  href: string;
  icon: LucideIcon;
  id: DashboardNavigationItemId;
  label: string;
};

const DASHBOARD_NAVIGATION_ITEMS = {
  home: {
    href: "/dashboard",
    icon: GaugeIcon,
    id: "home",
    label: "Home",
  },
  flightDocuments: {
    href: "/flight-documents",
    icon: FileTextIcon,
    id: "flightDocuments",
    label: "Flight Documents",
  },
  instructors: {
    href: "/instructors",
    icon: UsersIcon,
    id: "instructors",
    label: "Instructors",
  },
  schedule: {
    href: "/schedule",
    icon: CalendarClockIcon,
    id: "schedule",
    label: "Schedule",
  },
  students: {
    href: "/students",
    icon: GraduationCapIcon,
    id: "students",
    label: "Students",
  },
  studentReview: {
    href: "/student-review",
    icon: UserCheckIcon,
    id: "studentReview",
    label: "Student Review",
  },
  aircrafts: {
    href: "/aircrafts",
    icon: PlaneIcon,
    id: "aircrafts",
    label: "Aircrafts",
  },
  notams: {
    href: "/notams",
    icon: BellIcon,
    id: "notams",
    label: "NOTAMs",
  },
} satisfies Record<DashboardNavigationItemId, DashboardNavigationItem>;

const STUDENT_NAVIGATION_ITEM_IDS = [
  "home",
  "flightDocuments",
  "instructors",
  "schedule",
] as const satisfies readonly DashboardNavigationItemId[];

const INSTRUCTOR_NAVIGATION_ITEM_IDS = [
  ...STUDENT_NAVIGATION_ITEM_IDS,
  "students",
  "studentReview",
] as const satisfies readonly DashboardNavigationItemId[];

const ADMIN_NAVIGATION_ITEM_IDS = [
  "aircrafts",
  "notams",
  "schedule",
  "instructors",
] as const satisfies readonly DashboardNavigationItemId[];

const SUPERADMIN_NAVIGATION_ITEM_IDS = [
  ...INSTRUCTOR_NAVIGATION_ITEM_IDS,
  "aircrafts",
  "notams",
] as const satisfies readonly DashboardNavigationItemId[];

export const ADMIN_NAVIGATION_BY_DEPARTMENT = {
  [ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL]: ADMIN_NAVIGATION_ITEM_IDS,
  [ADMIN_DEPARTMENT.AIR_TRAFFIC_CONTROLLER]: ADMIN_NAVIGATION_ITEM_IDS,
  [ADMIN_DEPARTMENT.SAFETY_PERSONNEL]: ADMIN_NAVIGATION_ITEM_IDS,
} satisfies Record<AdminDepartment, readonly DashboardNavigationItemId[]>;

function resolveItems(itemIds: readonly DashboardNavigationItemId[]) {
  return itemIds.map((itemId) => DASHBOARD_NAVIGATION_ITEMS[itemId]);
}

export function getAdminNavigationItemIds(
  department: AdminDepartment | null,
) {
  if (!department) {
    return ADMIN_NAVIGATION_ITEM_IDS;
  }

  return ADMIN_NAVIGATION_BY_DEPARTMENT[department];
}

export function getDashboardNavigation(
  profile: Pick<Profile, "admin_department" | "role"> | null,
) {
  if (!profile) {
    return [];
  }

  if (profile.role === ROLE.SUPERADMIN) {
    return resolveItems(SUPERADMIN_NAVIGATION_ITEM_IDS);
  }

  if (profile.role === ROLE.ADMIN) {
    return resolveItems(getAdminNavigationItemIds(profile.admin_department));
  }

  if (profile.role === ROLE.INSTRUCTOR) {
    return resolveItems(INSTRUCTOR_NAVIGATION_ITEM_IDS);
  }

  return resolveItems(STUDENT_NAVIGATION_ITEM_IDS);
}
