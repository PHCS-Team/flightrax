import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import type {
  AdminDepartment,
  ApprovalStatus,
  Profile,
  ProfileRole,
} from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];
type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

type StudentProfileFields = Partial<
  Pick<
    StudentProfileRow,
    | "approval_status"
    | "id_document_content_type"
    | "id_document_path"
    | "id_document_size_bytes"
    | "id_document_uploaded_at"
    | "rejection_reason"
    | "student_id_number"
    | "submitted_at"
  >
>;

type AdminProfileFields = Pick<AdminProfileRow, "department">;

export type ProfileWithRoleProfiles = ProfileRow & {
  student_profiles: StudentProfileFields | null;
  admin_profiles: AdminProfileFields | null;
};

export function getEffectiveApprovalStatus(
  role: ProfileRole,
  studentApprovalStatus: ApprovalStatus | null,
): ApprovalStatus {
  if (role === ROLE.STUDENT) {
    return studentApprovalStatus ?? APPROVAL_STATUS.PENDING;
  }

  return APPROVAL_STATUS.APPROVED;
}

export function getAdminDepartment(
  role: ProfileRole,
  adminDepartment: AdminDepartment | null,
): AdminDepartment | null {
  return role === ROLE.ADMIN ? adminDepartment : null;
}

export function normalizeProfile(
  row: ProfileWithRoleProfiles,
  {
    includeStudentDocuments = false,
    profilePhotoUrl = null,
  }: {
    includeStudentDocuments?: boolean;
    profilePhotoUrl?: string | null;
  } = {},
): Profile {
  const profile: Profile = {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    profile_photo_path: row.profile_photo_path,
    profile_photo_content_type: row.profile_photo_content_type,
    profile_photo_size_bytes: row.profile_photo_size_bytes,
    profile_photo_uploaded_at: row.profile_photo_uploaded_at,
    profile_photo_url: profilePhotoUrl,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    admin_department: getAdminDepartment(
      row.role,
      row.admin_profiles?.department ?? null,
    ),
    approval_status: getEffectiveApprovalStatus(
      row.role,
      row.student_profiles?.approval_status ?? null,
    ),
  };

  if (!includeStudentDocuments) {
    return profile;
  }

  return {
    ...profile,
    student_id_number: row.student_profiles?.student_id_number ?? null,
    id_document_path: row.student_profiles?.id_document_path ?? null,
    id_document_content_type:
      row.student_profiles?.id_document_content_type ?? null,
    id_document_size_bytes: row.student_profiles?.id_document_size_bytes ?? null,
    id_document_uploaded_at: row.student_profiles?.id_document_uploaded_at ?? null,
    submitted_at: row.student_profiles?.submitted_at ?? null,
    rejection_reason: row.student_profiles?.rejection_reason ?? null,
  };
}
