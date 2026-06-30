import type { Database } from "@/shared/types/supabase";

export type ProfileRole = Database["public"]["Enums"]["app_role"];
export type AdminDepartment = Database["public"]["Enums"]["admin_department"];
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export type BaseProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentProfile = Database["public"]["Tables"]["student_profiles"]["Row"];

export type Profile = BaseProfile & {
  admin_department: AdminDepartment | null;
  approval_status: ApprovalStatus;
  profile_photo_url?: string | null;
  student_id_number?: string | null;
  id_document_path?: string | null;
  id_document_content_type?: string | null;
  id_document_size_bytes?: number | null;
  id_document_uploaded_at?: string | null;
  submitted_at?: string | null;
  rejection_reason?: string | null;
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
