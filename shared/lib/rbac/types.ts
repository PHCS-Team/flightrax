import type { Database } from "@/shared/types/supabase";

import { ACCOUNT_VIEW } from "@/modules/auth/constants/permissions";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import {
  STUDENTS_VIEW,
  STUDENTS_REVIEW,
} from "@/modules/students/constants/permissions";

export type ProfileRole = Database["public"]["Enums"]["app_role"];
export type AdminDepartment = Database["public"]["Enums"]["admin_department"];
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export type BaseProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentProfile =
  Database["public"]["Tables"]["student_profiles"]["Row"];

export type Profile = BaseProfile & {
  admin_department: AdminDepartment | null;
  approval_status: ApprovalStatus;
  license_type: string | null;
  license_number: string | null;
  rating: string | null;
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
  | typeof ACCOUNT_VIEW
  | "dashboard.view"
  | "flight_documents.view"
  | "instructors.view"
  | "schedule.view"
  | typeof AIRCRAFTS_VIEW
  | "notams.view"
  | typeof STUDENTS_VIEW
  | typeof STUDENTS_REVIEW
  | "admin.flight_operations_personnel"
  | "admin.air_traffic_controller"
  | "admin.safety_personnel"
  | "system.manage";
