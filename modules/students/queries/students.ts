import { APPROVAL_STATUS, ROLE, hasPermission } from "@/shared/lib/rbac/config";
import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { PROFILE_PHOTO_BUCKET } from "@/modules/auth/utils/profile-photo";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { ApprovedStudent } from "@/modules/students/types/student";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

type ApprovedStudentRow = Pick<
  StudentProfileRow,
  "approval_status" | "profile_id" | "student_id_number"
> & {
  profiles: Pick<
    ProfileRow,
    | "email"
    | "full_name"
    | "license_number"
    | "license_type"
    | "profile_photo_path"
    | "rating"
    | "role"
  > | null;
};

async function getSignedProfilePhotoUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function getApprovedStudents() {
  const viewer = await getCurrentProfile();

  if (!viewer || !hasPermission(viewer.role, "students.view", viewer.admin_department)) {
    return [] satisfies ApprovedStudent[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("approval_status, profile_id, student_id_number, profiles!student_profiles_profile_id_fkey(email, full_name, license_number, license_type, profile_photo_path, rating, role)")
    .eq("approval_status", APPROVAL_STATUS.APPROVED)
    .order("student_id_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data satisfies ApprovedStudentRow[];
  const students = rows.filter((row) => row.profiles?.role === ROLE.STUDENT);

  return Promise.all(
    students.map(async (row) => ({
      id: row.profile_id,
      email: row.profiles?.email ?? "Unknown email",
      fullName: row.profiles?.full_name ?? "Unknown student",
      studentIdNumber: row.student_id_number ?? "Missing ID number",
      licenseType: row.profiles?.license_type ?? null,
      licenseNumber: row.profiles?.license_number ?? null,
      rating: row.profiles?.rating ?? null,
      profilePhotoUrl: await getSignedProfilePhotoUrl(
        row.profiles?.profile_photo_path ?? null,
      ),
    })),
  );
}
