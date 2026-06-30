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

export const PUBLIC_AUTH_ROLES: ProfileRole[] = [
  ROLE.STUDENT,
  ROLE.INSTRUCTOR,
  ROLE.ADMIN,
];

export const ADMIN_DEPARTMENT = {
  FLIGHT_OPERATIONS_PERSONNEL: "flight_operations_personnel",
  AIR_TRAFFIC_CONTROLLER: "air_traffic_controller",
  SAFETY_PERSONNEL: "safety_personnel",
} as const satisfies Record<string, AdminDepartment>;

export const ADMIN_DEPARTMENTS: AdminDepartment[] = Object.values(ADMIN_DEPARTMENT);

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const satisfies Record<string, ApprovalStatus>;

export const APPROVAL_STATUSES: ApprovalStatus[] = Object.values(APPROVAL_STATUS);

const ROLE_PERMISSIONS = {
  [ROLE.STUDENT]: [
    "account.view",
    "dashboard.view",
    "flight_documents.view",
    "instructors.view",
    "schedule.view",
  ],
  [ROLE.INSTRUCTOR]: [
    "account.view",
    "dashboard.view",
    "flight_documents.view",
    "instructors.view",
    "schedule.view",
    "students.review",
  ],
  [ROLE.ADMIN]: [
    "account.view",
    "aircrafts.view",
    "notams.view",
    "schedule.view",
    "instructors.view",
  ],
  [ROLE.SUPERADMIN]: ["system.manage"],
} satisfies Record<ProfileRole, Permission[]>;

const ADMIN_DEPARTMENT_PERMISSIONS = {
  [ADMIN_DEPARTMENT.FLIGHT_OPERATIONS_PERSONNEL]: [
    "admin.flight_operations_personnel",
    "aircrafts.view",
    "notams.view",
    "schedule.view",
    "instructors.view",
  ],
  [ADMIN_DEPARTMENT.AIR_TRAFFIC_CONTROLLER]: [
    "admin.air_traffic_controller",
    "aircrafts.view",
    "notams.view",
    "schedule.view",
    "instructors.view",
  ],
  [ADMIN_DEPARTMENT.SAFETY_PERSONNEL]: [
    "admin.safety_personnel",
    "aircrafts.view",
    "notams.view",
    "schedule.view",
    "instructors.view",
  ],
} satisfies Record<AdminDepartment, Permission[]>;

export function getRolePermissions(role: ProfileRole, department?: AdminDepartment | null) {
  if (role === ROLE.SUPERADMIN) {
    return ["system.manage"] satisfies Permission[];
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
  return role === ROLE.SUPERADMIN || getRolePermissions(role, department).includes(permission);
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
