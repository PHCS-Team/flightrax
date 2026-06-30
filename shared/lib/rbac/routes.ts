import { APPROVAL_STATUS, hasPermission } from "@/shared/lib/rbac/config";
import type { Permission, Profile, ProfileRole } from "@/shared/lib/rbac/types";

const PROTECTED_ROUTES: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/dashboard", permission: "dashboard.view" },
  { prefix: "/flights", permission: "flights.view" },
  { prefix: "/scheduling", permission: "scheduling.view" },
  { prefix: "/monitoring", permission: "monitoring.view" },
  { prefix: "/aircraft", permission: "aircraft.view" },
  { prefix: "/crew", permission: "crew.view" },
];

export function getAuthRedirectForRole(role: ProfileRole) {
  return `/login/${role}`;
}

export function getDefaultRedirectForProfile(profile: Profile) {
  if (profile.approval_status !== APPROVAL_STATUS.APPROVED) {
    return "/pending-approval";
  }

  return "/dashboard";
}

export function getRequiredPermission(pathname: string) {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix))?.permission;
}

export function canAccessPath(profile: Profile, pathname: string) {
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
  return Boolean(getRequiredPermission(pathname));
}

export function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/") || pathname === "/register" || pathname.startsWith("/register/");
}
