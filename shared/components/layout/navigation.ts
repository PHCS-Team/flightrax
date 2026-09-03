import {
  BellIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  GaugeIcon,
  GraduationCapIcon,
  NotebookTextIcon,
  PlaneIcon,
  PlaneTakeoffIcon,
  UserCheckIcon,
  UsersIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";

import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import { DASHBOARD_VIEW } from "@/modules/dashboard/constants/permissions";
import {
  FLIGHT_DOCUMENTS_VIEW,
  FLIGHT_PLANS_VIEW,
  FLIGHT_REQUESTS_VIEW,
} from "@/modules/flight-documents/constants/permissions";
import { INSTRUCTORS_VIEW } from "@/modules/instructors/constants/permissions";
import { NOTAMS_VIEW } from "@/modules/notams/constants/permissions";
import { SCHEDULE_VIEW } from "@/modules/schedule/constants/permissions";
import { STUDENTS_VIEW } from "@/modules/students/constants/permissions";
import { hasPermission } from "@/shared/lib/rbac/config";
import { SYSTEM_MANAGE } from "@/shared/lib/rbac/permissions";
import type { Permission, Profile } from "@/shared/lib/rbac/types";

export type DashboardNavigationItemId =
  | "home"
  | "flightDocuments"
  | "flightPlans"
  | "flightRequests"
  | "instructors"
  | "schedule"
  | "students"
  | "accountReview"
  | "aircrafts"
  | "notams";

export type DashboardNavigationItem = {
  href: string;
  icon: LucideIcon;
  id: DashboardNavigationItemId;
  label: string;
  permission: Permission;
};

export type DashboardNavigationGroupId = "users" | "flights";

export type DashboardNavigationGroup = {
  icon: LucideIcon;
  id: DashboardNavigationGroupId;
  items: readonly DashboardNavigationItem[];
  label: string;
};

export type DashboardNavigationSection =
  | DashboardNavigationItem
  | DashboardNavigationGroup;

export type DashboardNavigation = readonly DashboardNavigationSection[];

const DASHBOARD_NAVIGATION_ITEMS = {
  home: {
    href: "/dashboard",
    icon: GaugeIcon,
    id: "home",
    label: "Home",
    permission: DASHBOARD_VIEW,
  },
  flightDocuments: {
    href: "/flight-documents",
    icon: FileTextIcon,
    id: "flightDocuments",
    label: "Flight Documents",
    permission: FLIGHT_DOCUMENTS_VIEW,
  },
  flightPlans: {
    href: "/flight-plans",
    icon: NotebookTextIcon,
    id: "flightPlans",
    label: "Flight Plans",
    permission: FLIGHT_PLANS_VIEW,
  },
  flightRequests: {
    href: "/flight-requests",
    icon: ClipboardCheckIcon,
    id: "flightRequests",
    label: "Flight Requests",
    permission: FLIGHT_REQUESTS_VIEW,
  },
  instructors: {
    href: "/instructors",
    icon: UsersIcon,
    id: "instructors",
    label: "Instructors",
    permission: INSTRUCTORS_VIEW,
  },
  schedule: {
    href: "/schedule",
    icon: CalendarClockIcon,
    id: "schedule",
    label: "Schedule",
    permission: SCHEDULE_VIEW,
  },
  students: {
    href: "/students",
    icon: GraduationCapIcon,
    id: "students",
    label: "Students",
    permission: STUDENTS_VIEW,
  },
  accountReview: {
    href: "/account-review",
    icon: UserCheckIcon,
    id: "accountReview",
    label: "Account Review",
    permission: ACCOUNT_REVIEW,
  },
  aircrafts: {
    href: "/aircrafts",
    icon: PlaneIcon,
    id: "aircrafts",
    label: "Aircrafts",
    permission: SYSTEM_MANAGE,
  },
  notams: {
    href: "/notams",
    icon: BellIcon,
    id: "notams",
    label: "NOTAMs",
    permission: NOTAMS_VIEW,
  },
} satisfies Record<DashboardNavigationItemId, DashboardNavigationItem>;

const DASHBOARD_NAVIGATION: DashboardNavigation = [
  DASHBOARD_NAVIGATION_ITEMS.home,
  {
    id: "flights",
    icon: PlaneTakeoffIcon,
    label: "Flights",
    items: [
      DASHBOARD_NAVIGATION_ITEMS.flightDocuments,
      DASHBOARD_NAVIGATION_ITEMS.flightRequests,
    ],
  },
  DASHBOARD_NAVIGATION_ITEMS.flightPlans,
  DASHBOARD_NAVIGATION_ITEMS.schedule,
  {
    id: "users",
    icon: UsersRoundIcon,
    label: "Users",
    items: [
      DASHBOARD_NAVIGATION_ITEMS.instructors,
      DASHBOARD_NAVIGATION_ITEMS.students,
      DASHBOARD_NAVIGATION_ITEMS.accountReview,
    ],
  },
  DASHBOARD_NAVIGATION_ITEMS.aircrafts,
  DASHBOARD_NAVIGATION_ITEMS.notams,
];

export function getDashboardNavigation(
  profile: Pick<Profile, "admin_department" | "role"> | null,
): DashboardNavigation {
  if (!profile) {
    return [];
  }

  const canSee = (item: DashboardNavigationItem) =>
    hasPermission(profile.role, item.permission, profile.admin_department);

  return DASHBOARD_NAVIGATION.flatMap<DashboardNavigationSection>((section) => {
    if (isNavigationItem(section)) {
      return canSee(section) ? [section] : [];
    }

    const items = section.items.filter(canSee);

    if (items.length === 0) {
      return [];
    }

    if (items.length === 1) {
      return [items[0]];
    }

    return [{ ...section, items }];
  });
}

export function isNavigationItem(
  section: DashboardNavigationSection,
): section is DashboardNavigationItem {
  return "href" in section;
}

export function isNavigationGroup(
  section: DashboardNavigationSection,
): section is DashboardNavigationGroup {
  return !("href" in section);
}
