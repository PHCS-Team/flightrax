import { ACCOUNT_VIEW } from "@/modules/auth/constants/permissions";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import { INSTRUCTORS_VIEW } from "@/modules/instructors/constants/permissions";
import { STUDENTS_VIEW } from "@/modules/students/constants/permissions";
import { DASHBOARD_VIEW } from "@/modules/dashboard/constants/permissions";
import {
  FLIGHT_DOCUMENTS_VIEW,
  FLIGHT_PLANS_VIEW,
  FLIGHT_REQUESTS_VIEW,
} from "@/modules/flight-documents/constants/permissions";
import { SCHEDULE_VIEW } from "@/modules/schedule/constants/permissions";
import { NOTAMS_VIEW } from "@/modules/notams/constants/permissions";
import { APPROVAL_STATUS, hasPermission } from "@/shared/lib/rbac/config";
import type { Permission, Profile, ProfileRole } from "@/shared/lib/rbac/types";

export type RouteAccessProfile = Pick<
  Profile,
  "admin_department" | "approval_status" | "role"
>;

const PROTECTED_ROUTES: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/account", permission: ACCOUNT_VIEW },
  { prefix: "/dashboard", permission: DASHBOARD_VIEW },
  { prefix: "/flight-documents", permission: FLIGHT_DOCUMENTS_VIEW },
  { prefix: "/flight-requests", permission: FLIGHT_REQUESTS_VIEW },
  { prefix: "/flight-plans", permission: FLIGHT_PLANS_VIEW },
  { prefix: "/instructors", permission: INSTRUCTORS_VIEW },
  { prefix: "/schedule", permission: SCHEDULE_VIEW },
  { prefix: "/aircrafts", permission: AIRCRAFTS_VIEW },
  { prefix: "/notams", permission: NOTAMS_VIEW },
  { prefix: "/students", permission: STUDENTS_VIEW },
  { prefix: "/account-review", permission: ACCOUNT_REVIEW },
];
const AUTH_REQUIRED_ROUTES = ["/pending-approval"];

export function getAuthRedirectForRole(role: ProfileRole) {
  return `/login/${role}`;
}

export function getDefaultRedirectForProfile(profile: RouteAccessProfile) {
  if (profile.approval_status !== APPROVAL_STATUS.APPROVED) {
    return "/pending-approval";
  }

  return "/dashboard";
}

export function getRequiredPermission(pathname: string) {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix))?.permission;
}

export function canAccessPath(profile: RouteAccessProfile, pathname: string) {
  if (profile.approval_status !== APPROVAL_STATUS.APPROVED) {
    return pathname === "/pending-approval";
  }

  const permission = getRequiredPermission(pathname);

  if (!permission) {
    return true;
  }

  return hasPermission(profile.role, permission, profile.admin_department);
}

export function isProtectedPath(pathname: string) {
  return (
    AUTH_REQUIRED_ROUTES.some((route) => pathname === route) ||
    Boolean(getRequiredPermission(pathname))
  );
}

export function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/") || pathname === "/register" || pathname.startsWith("/register/");
}
