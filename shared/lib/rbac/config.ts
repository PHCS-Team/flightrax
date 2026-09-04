import { ACCOUNT_VIEW } from "@/modules/auth/constants/permissions";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import {
  INSTRUCTORS_MANAGE,
  INSTRUCTORS_VIEW,
} from "@/modules/instructors/constants/permissions";
import { STUDENTS_VIEW } from "@/modules/students/constants/permissions";
import { DASHBOARD_VIEW } from "@/modules/dashboard/constants/permissions";
import {
  FLIGHT_DOCUMENTS_VIEW,
  FLIGHT_PLANS_VIEW,
  FLIGHT_REQUESTS_VIEW,
} from "@/modules/flight-documents/constants/permissions";
import {
  SCHEDULE_MANAGE,
  SCHEDULE_VIEW,
} from "@/modules/schedule/constants/permissions";
import {
  NOTAMS_MANAGE,
  NOTAMS_VIEW,
} from "@/modules/notams/constants/permissions";
import {
  CREDENTIALS_VIEW_DETAILS,
  SYSTEM_MANAGE,
} from "@/shared/lib/rbac/permissions";
import type {
  AdminDepartment,
  ApprovalStatus,
  Permission,
  ProfileRole,
} from "@/shared/lib/rbac/types";

export const ROLE = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const satisfies Record<string, ProfileRole>;

export const ROLES: ProfileRole[] = Object.values(ROLE);

// Roles offered on the public login/register pickers. Admin access is
// deliberately excluded — it lives on its own pages reached via the
// hold-to-fly plane trigger, since admins skip the account review gate.
export const PUBLIC_AUTH_ROLES: ProfileRole[] = [ROLE.STUDENT, ROLE.INSTRUCTOR];

export const PASSCODE_ROLES: ProfileRole[] = [ROLE.STUDENT, ROLE.INSTRUCTOR];

export function canManagePasscode(role: ProfileRole) {
  return PASSCODE_ROLES.includes(role);
}

export const ACCOUNT_REQUEST_ROLES = [ROLE.STUDENT, ROLE.INSTRUCTOR] as const;

export type AccountRequestRole = (typeof ACCOUNT_REQUEST_ROLES)[number];

export function requiresAccountApproval(
  role: ProfileRole,
): role is AccountRequestRole {
  return (ACCOUNT_REQUEST_ROLES as readonly ProfileRole[]).includes(role);
}

export const ADMIN_DEPARTMENT = {
  FLIGHT_OPERATIONS_PERSONNEL: "flight_operations_personnel",
  AIR_TRAFFIC_CONTROLLER: "air_traffic_controller",
  SAFETY_PERSONNEL: "safety_personnel",
} as const satisfies Record<string, AdminDepartment>;

export const ADMIN_DEPARTMENTS: AdminDepartment[] =
  Object.values(ADMIN_DEPARTMENT);

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const satisfies Record<string, ApprovalStatus>;

export const APPROVAL_STATUSES: ApprovalStatus[] =
  Object.values(APPROVAL_STATUS);

const ROLE_PERMISSIONS = {
  [ROLE.STUDENT]: [
    ACCOUNT_VIEW,
    DASHBOARD_VIEW,
    FLIGHT_DOCUMENTS_VIEW,
    INSTRUCTORS_VIEW,
    SCHEDULE_VIEW,
  ],
  [ROLE.INSTRUCTOR]: [
    ACCOUNT_VIEW,
    CREDENTIALS_VIEW_DETAILS,
    DASHBOARD_VIEW,
    FLIGHT_DOCUMENTS_VIEW,
    FLIGHT_REQUESTS_VIEW,
    INSTRUCTORS_VIEW,
    SCHEDULE_VIEW,
    STUDENTS_VIEW,
  ],
  [ROLE.ADMIN]: [
    ACCOUNT_VIEW,
    DASHBOARD_VIEW,
    INSTRUCTORS_VIEW,
    SCHEDULE_VIEW,
    STUDENTS_VIEW,
  ],
  [ROLE.SUPERADMIN]: [SYSTEM_MANAGE],
} satisfies Record<ProfileRole, Permission[]>;

const ADMIN_DEPARTMENT_PERMISSIONS = {
  [ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL]: [
    ACCOUNT_REVIEW,
    AIRCRAFTS_VIEW,
    CREDENTIALS_VIEW_DETAILS,
    INSTRUCTORS_MANAGE,
    SCHEDULE_MANAGE,
  ],
  [ADMIN_DEPARTMENT.AIR_TRAFFIC_CONTROLLER]: [FLIGHT_PLANS_VIEW],
  [ADMIN_DEPARTMENT.SAFETY_PERSONNEL]: [NOTAMS_MANAGE, NOTAMS_VIEW],
} satisfies Record<AdminDepartment, Permission[]>;

export function getRolePermissions(
  role: ProfileRole,
  department?: AdminDepartment | null,
) {
  if (role === ROLE.SUPERADMIN) {
    return [SYSTEM_MANAGE] satisfies Permission[];
  }

  const permissions = new Set<Permission>(ROLE_PERMISSIONS[role]);

  if (role === ROLE.ADMIN && department) {
    ADMIN_DEPARTMENT_PERMISSIONS[department].forEach((permission) => {
      permissions.add(permission);
    });
  }

  return Array.from(permissions);
}

export function hasPermission(
  role: ProfileRole,
  permission: Permission,
  department?: AdminDepartment | null,
) {
  return (
    role === ROLE.SUPERADMIN ||
    getRolePermissions(role, department).includes(permission)
  );
}

export const ROLE_LABELS = {
  [ROLE.STUDENT]: "Student",
  [ROLE.INSTRUCTOR]: "Instructor",
  [ROLE.ADMIN]: "Admin",
  [ROLE.SUPERADMIN]: "Superadmin",
} satisfies Record<ProfileRole, string>;

export const ADMIN_DEPARTMENT_LABELS = {
  [ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL]: "Flight Operation Personnel",
  [ADMIN_DEPARTMENT.AIR_TRAFFIC_CONTROLLER]: "Air Traffic Controller",
  [ADMIN_DEPARTMENT.SAFETY_PERSONNEL]: "Safety Personnel",
} satisfies Record<AdminDepartment, string>;
