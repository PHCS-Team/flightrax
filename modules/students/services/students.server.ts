import "server-only";

import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";
import type {
  ApprovedStudent,
  ApprovedStudentRow,
} from "@/modules/students/types/student";

export async function getApprovedStudentsForAuthorizedViewer(): Promise<
  ApprovedStudent[]
> {
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
  const { storage } = supabase;

  return students.map((row) => ({
    id: row.profile_id,
    email: row.profiles?.email ?? "Unknown email",
    fullName: row.profiles?.full_name ?? "Unknown student",
    studentIdNumber: row.student_id_number ?? "Missing ID number",
    licenseType: row.profiles?.license_type ?? null,
    licenseNumber: row.profiles?.license_number ?? null,
    rating: row.profiles?.rating ?? null,
    profilePhotoUrl: row.profiles?.profile_photo_path
      ? storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(row.profiles.profile_photo_path).data.publicUrl
      : null,
  }));
}
