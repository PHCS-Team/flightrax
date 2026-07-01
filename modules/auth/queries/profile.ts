import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import { PROFILE_PHOTO_BUCKET } from "@/modules/auth/utils/profile-photo";
import {
  normalizeProfile,
  type ProfileWithRoleProfiles,
} from "@/shared/lib/rbac/profile";
import { createClient } from "@/shared/lib/supabase/server";
import type { Profile } from "@/shared/lib/rbac/types";
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
type PendingStudentWithProfile = StudentProfileApproval & {
  profiles: ProfileRow | null;
};

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
  return normalizeProfile(row, {
    includeStudentDocuments: true,
    profilePhotoUrl: await getSignedProfilePhotoUrl(row.profile_photo_path),
  });
}

function toPendingStudentProfile(row: PendingStudentWithProfile): Profile | null {
  if (!row.profiles) {
    return null;
  }

  return {
    id: row.profiles.id,
    email: row.profiles.email,
    full_name: row.profiles.full_name,
    license_type: row.profiles.license_type,
    license_number: row.profiles.license_number,
    rating: row.profiles.rating,
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
