import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { PROFILE_PHOTO_BUCKET } from "@/modules/auth/utils/profile-photo";
import { createClient } from "@/shared/lib/supabase/server";
import type { AdminDepartment, ApprovalStatus, Profile, ProfileRole } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileApproval = Pick<
  Database["public"]["Tables"]["student_profiles"]["Row"],
  | "approval_status"
  | "id_document_content_type"
  | "id_document_path"
  | "id_document_size_bytes"
  | "id_document_uploaded_at"
  | "rejection_reason"
  | "student_id_number"
  | "submitted_at"
>;
type AdminProfileDepartment = Pick<
  Database["public"]["Tables"]["admin_profiles"]["Row"],
  "department"
>;

type ProfileWithRoleProfiles = ProfileRow & {
  student_profiles: StudentProfileApproval | null;
  admin_profiles: AdminProfileDepartment | null;
};

type PendingStudentWithProfile = StudentProfileApproval & {
  profiles: ProfileRow | null;
};

function getEffectiveApprovalStatus(
  role: ProfileRole,
  studentApprovalStatus: ApprovalStatus | null,
): ApprovalStatus {
  if (role === ROLE.STUDENT) {
    return studentApprovalStatus ?? APPROVAL_STATUS.PENDING;
  }

  return APPROVAL_STATUS.APPROVED;
}

function getAdminDepartment(
  role: ProfileRole,
  adminDepartment: AdminDepartment | null,
): AdminDepartment | null {
  return role === ROLE.ADMIN ? adminDepartment : null;
}

async function getSignedProfilePhotoUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

async function toProfile(row: ProfileWithRoleProfiles): Promise<Profile> {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    profile_photo_path: row.profile_photo_path,
    profile_photo_content_type: row.profile_photo_content_type,
    profile_photo_size_bytes: row.profile_photo_size_bytes,
    profile_photo_uploaded_at: row.profile_photo_uploaded_at,
    profile_photo_url: await getSignedProfilePhotoUrl(row.profile_photo_path),
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    admin_department: getAdminDepartment(row.role, row.admin_profiles?.department ?? null),
    approval_status: getEffectiveApprovalStatus(
      row.role,
      row.student_profiles?.approval_status ?? null,
    ),
    student_id_number: row.student_profiles?.student_id_number ?? null,
    id_document_path: row.student_profiles?.id_document_path ?? null,
    id_document_content_type: row.student_profiles?.id_document_content_type ?? null,
    id_document_size_bytes: row.student_profiles?.id_document_size_bytes ?? null,
    id_document_uploaded_at: row.student_profiles?.id_document_uploaded_at ?? null,
    submitted_at: row.student_profiles?.submitted_at ?? null,
    rejection_reason: row.student_profiles?.rejection_reason ?? null,
  };
}

function toPendingStudentProfile(row: PendingStudentWithProfile): Profile | null {
  if (!row.profiles) {
    return null;
  }

  return {
    id: row.profiles.id,
    email: row.profiles.email,
    full_name: row.profiles.full_name,
    profile_photo_path: row.profiles.profile_photo_path,
    profile_photo_content_type: row.profiles.profile_photo_content_type,
    profile_photo_size_bytes: row.profiles.profile_photo_size_bytes,
    profile_photo_uploaded_at: row.profiles.profile_photo_uploaded_at,
    profile_photo_url: null,
    role: row.profiles.role,
    created_at: row.profiles.created_at,
    updated_at: row.profiles.updated_at,
    admin_department: null,
    approval_status: row.approval_status,
    student_id_number: row.student_id_number,
    id_document_path: row.id_document_path,
    id_document_content_type: row.id_document_content_type,
    id_document_size_bytes: row.id_document_size_bytes,
    id_document_uploaded_at: row.id_document_uploaded_at,
    submitted_at: row.submitted_at,
    rejection_reason: row.rejection_reason,
  };
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getProfileByUserId(user.id);
}

export async function getProfileByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, student_profiles!student_profiles_profile_id_fkey(approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, rejection_reason, student_id_number, submitted_at), admin_profiles!admin_profiles_profile_id_fkey(department)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return toProfile(data);
}

export async function getPendingStudentsForApproval() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, rejection_reason, student_id_number, submitted_at, profiles!student_profiles_profile_id_fkey(*)")
    .eq("approval_status", APPROVAL_STATUS.PENDING)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data
    .map(toPendingStudentProfile)
    .filter((profile): profile is Profile => profile !== null);
}
