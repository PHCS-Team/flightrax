import type { Database } from "@/shared/types/supabase";

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
  | typeof DASHBOARD_VIEW
  | typeof FLIGHT_DOCUMENTS_VIEW
  | typeof FLIGHT_PLANS_VIEW
  | typeof FLIGHT_REQUESTS_VIEW
  | typeof INSTRUCTORS_VIEW
  | typeof SCHEDULE_VIEW
  | typeof AIRCRAFTS_VIEW
  | typeof NOTAMS_VIEW
  | typeof STUDENTS_VIEW
  | typeof ACCOUNT_REVIEW
  | "admin.flight_operations_personnel"
  | "admin.air_traffic_controller"
  | "admin.safety_personnel"
  | "system.manage";
