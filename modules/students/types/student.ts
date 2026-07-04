import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

export type ApprovedStudent = {
  id: string;
  email: string;
  fullName: string;
  studentIdNumber: string;
  licenseType: string | null;
  licenseNumber: string | null;
  rating: string | null;
  profilePhotoUrl: string | null;
};

export type ApprovedStudentRow = Pick<
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

export type UpdateStudentLicenseTargetRow = Pick<
  StudentProfileRow,
  "approval_status" | "profile_id"
> & {
  profiles: Pick<ProfileRow, "role"> | null;
};
