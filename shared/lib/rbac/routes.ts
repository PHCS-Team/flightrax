import {
  STUDENTS_VIEW,
  STUDENTS_REVIEW,
} from "@/modules/students/constants/permissions";
import { APPROVAL_STATUS, ROLE, hasPermission } from "@/shared/lib/rbac/config";
import type { Permission, Profile, ProfileRole } from "@/shared/lib/rbac/types";

export type RouteAccessProfile = Pick<
  Profile,
  "admin_department" | "approval_status" | "role"
>;

const PROTECTED_ROUTES: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/account", permission: "account.view" },
  { prefix: "/dashboard", permission: "dashboard.view" },
  { prefix: "/flight-documents", permission: "flight_documents.view" },
  { prefix: "/instructors", permission: "instructors.view" },
  { prefix: "/schedule", permission: "schedule.view" },
  { prefix: "/aircrafts", permission: "aircrafts.view" },
  { prefix: "/notams", permission: "notams.view" },
  { prefix: "/students", permission: STUDENTS_VIEW },
  { prefix: "/student-review", permission: STUDENTS_REVIEW },
];
const AUTH_REQUIRED_ROUTES = ["/pending-approval"];

export function getAuthRedirectForRole(role: ProfileRole) {
  return `/login/${role}`;
}

export function getDefaultRedirectForProfile(profile: RouteAccessProfile) {
  if (profile.approval_status !== APPROVAL_STATUS.APPROVED) {
    return "/pending-approval";
  }

  if (profile.role === ROLE.ADMIN) {
    return "/aircrafts";
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
