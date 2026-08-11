import type { Database } from "@/shared/types/supabase";

import { ACCOUNT_VIEW } from "@/modules/auth/constants/permissions";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import { INSTRUCTORS_VIEW } from "@/modules/instructors/constants/permissions";
import { STUDENTS_VIEW } from "@/modules/students/constants/permissions";

export type ProfileRole = Database["public"]["Enums"]["app_role"];
export type AdminDepartment = Database["public"]["Enums"]["admin_department"];
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export type BaseProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type AccountRequest =
  Database["public"]["Tables"]["account_requests"]["Row"];

export type Profile = BaseProfile & {
  admin_department: AdminDepartment | null;
  approval_status: ApprovalStatus;
  profile_photo_url?: string | null;
  id_number?: string | null;
  id_document_path?: string | null;
  id_document_content_type?: string | null;
  id_document_size_bytes?: number | null;
  id_document_uploaded_at?: string | null;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  signature_svg?: string | null;
};

export type Permission =
  | typeof ACCOUNT_VIEW
  | "dashboard.view"
  | "flight_documents.view"
  | typeof INSTRUCTORS_VIEW
  | "schedule.view"
  | typeof AIRCRAFTS_VIEW
  | "notams.view"
  | typeof STUDENTS_VIEW
  | typeof ACCOUNT_REVIEW
  | "admin.flight_operations_personnel"
  | "admin.air_traffic_controller"
  | "admin.safety_personnel"
  | "system.manage";
