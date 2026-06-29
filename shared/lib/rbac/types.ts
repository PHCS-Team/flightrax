import type { Database } from "@/shared/types/supabase";

export type ProfileRole = Database["public"]["Enums"]["app_role"];
export type AdminDepartment = Database["public"]["Enums"]["admin_department"];
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export type BaseProfile = Database["public"]["Tables"]["profiles"]["Row"];

export type Profile = BaseProfile & {
  admin_department: AdminDepartment | null;
  approval_status: ApprovalStatus;
};

export type Permission =
  | "dashboard.view"
  | "flights.view"
  | "scheduling.view"
  | "monitoring.view"
  | "aircraft.view"
  | "crew.view"
  | "students.approve"
  | "admin.flight_operations_personnel"
  | "admin.air_traffic_controller"
  | "admin.safety_personnel"
  | "system.manage";
