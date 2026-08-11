import {
  APPROVAL_STATUS,
  ROLE,
  requiresAccountApproval,
} from "@/shared/lib/rbac/config";
import type {
  AdminDepartment,
  ApprovalStatus,
  Profile,
  ProfileRole,
} from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRequestRow = Database["public"]["Tables"]["account_requests"]["Row"];
type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

type AccountRequestFields = Partial<
  Pick<
    AccountRequestRow,
    | "approval_status"
    | "id_document_content_type"
    | "id_document_path"
    | "id_document_size_bytes"
    | "id_document_uploaded_at"
    | "id_number"
    | "rejection_reason"
    | "submitted_at"
  >
>;

type AdminProfileFields = Pick<AdminProfileRow, "department">;

export type ProfileWithRoleProfiles = ProfileRow & {
  account_requests: AccountRequestFields | null;
  admin_profiles: AdminProfileFields | null;
};

export function getEffectiveApprovalStatus(
  role: ProfileRole,
  requestApprovalStatus: ApprovalStatus | null,
): ApprovalStatus {
  if (requiresAccountApproval(role)) {
    return requestApprovalStatus ?? APPROVAL_STATUS.PENDING;
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
    includeRequestDetails = false,
    profilePhotoUrl = null,
  }: {
    includeRequestDetails?: boolean;
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
    signature_svg: row.signature_svg,
    passcode_hash: row.passcode_hash,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    admin_department: getAdminDepartment(
      row.role,
      row.admin_profiles?.department ?? null,
    ),
    approval_status: getEffectiveApprovalStatus(
      row.role,
      row.account_requests?.approval_status ?? null,
    ),
  };

  if (!includeRequestDetails) {
    return profile;
  }

  return {
    ...profile,
    id_number: row.account_requests?.id_number ?? null,
    id_document_path: row.account_requests?.id_document_path ?? null,
    id_document_content_type:
      row.account_requests?.id_document_content_type ?? null,
    id_document_size_bytes: row.account_requests?.id_document_size_bytes ?? null,
    id_document_uploaded_at:
      row.account_requests?.id_document_uploaded_at ?? null,
    submitted_at: row.account_requests?.submitted_at ?? null,
    rejection_reason: row.account_requests?.rejection_reason ?? null,
  };
}
