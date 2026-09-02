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

import { ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

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
  },
  flightDocuments: {
    href: "/flight-documents",
    icon: FileTextIcon,
    id: "flightDocuments",
    label: "Flight Documents",
  },
  flightPlans: {
    href: "/flight-plans",
    icon: NotebookTextIcon,
    id: "flightPlans",
    label: "Flight Plans",
  },
  flightRequests: {
    href: "/flight-requests",
    icon: ClipboardCheckIcon,
    id: "flightRequests",
    label: "Flight Requests",
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
  accountReview: {
    href: "/account-review",
    icon: UserCheckIcon,
    id: "accountReview",
    label: "Account Review",
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

const USERS_GROUP: DashboardNavigationGroup = {
  id: "users",
  icon: UsersRoundIcon,
  label: "Users",
  items: [
    DASHBOARD_NAVIGATION_ITEMS.instructors,
    DASHBOARD_NAVIGATION_ITEMS.students,
    DASHBOARD_NAVIGATION_ITEMS.accountReview,
  ],
};

const STUDENT_NAVIGATION: DashboardNavigation = [
  DASHBOARD_NAVIGATION_ITEMS.home,
  DASHBOARD_NAVIGATION_ITEMS.flightDocuments,
  DASHBOARD_NAVIGATION_ITEMS.instructors,
  DASHBOARD_NAVIGATION_ITEMS.schedule,
];

const INSTRUCTOR_USERS_GROUP: DashboardNavigationGroup = {
  id: "users",
  icon: UsersRoundIcon,
  label: "Users",
  items: [
    DASHBOARD_NAVIGATION_ITEMS.instructors,
    DASHBOARD_NAVIGATION_ITEMS.students,
  ],
};

// Instructors both file their own flight plans and review other pilots'
// requests, so their flight pages live under one "Flights" group.
// Superadmins can do everything, so they get the same grouping.
const FLIGHTS_GROUP: DashboardNavigationGroup = {
  id: "flights",
  icon: PlaneTakeoffIcon,
  label: "Flights",
  items: [
    DASHBOARD_NAVIGATION_ITEMS.flightDocuments,
    DASHBOARD_NAVIGATION_ITEMS.flightRequests,
  ],
};

const INSTRUCTOR_NAVIGATION: DashboardNavigation = [
  DASHBOARD_NAVIGATION_ITEMS.home,
  FLIGHTS_GROUP,
  INSTRUCTOR_USERS_GROUP,
  DASHBOARD_NAVIGATION_ITEMS.schedule,
];

const ADMIN_NAVIGATION: DashboardNavigation = [
  DASHBOARD_NAVIGATION_ITEMS.home,
  DASHBOARD_NAVIGATION_ITEMS.flightPlans,
  DASHBOARD_NAVIGATION_ITEMS.schedule,
  USERS_GROUP,
  DASHBOARD_NAVIGATION_ITEMS.aircrafts,
  DASHBOARD_NAVIGATION_ITEMS.notams,
];

const SUPERADMIN_NAVIGATION: DashboardNavigation = [
  DASHBOARD_NAVIGATION_ITEMS.home,
  FLIGHTS_GROUP,
  DASHBOARD_NAVIGATION_ITEMS.flightPlans,
  DASHBOARD_NAVIGATION_ITEMS.schedule,
  USERS_GROUP,
  DASHBOARD_NAVIGATION_ITEMS.aircrafts,
  DASHBOARD_NAVIGATION_ITEMS.notams,
];

export function getDashboardNavigation(
  profile: Pick<Profile, "role"> | null,
): DashboardNavigation {
  if (!profile) {
    return [];
  }

  if (profile.role === ROLE.SUPERADMIN) {
    return SUPERADMIN_NAVIGATION;
  }

  if (profile.role === ROLE.ADMIN) {
    return ADMIN_NAVIGATION;
  }

  if (profile.role === ROLE.INSTRUCTOR) {
    return INSTRUCTOR_NAVIGATION;
  }

  return STUDENT_NAVIGATION;
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
