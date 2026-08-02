import type { LicenseSummary } from "@/shared/types/license-summary";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileRow =
  Database["public"]["Tables"]["student_profiles"]["Row"];

export type ApprovedStudent = {
  id: string;
  email: string;
  fullName: string;
  studentIdNumber: string;
  profilePhotoUrl: string | null;
  licenses: LicenseSummary[];
};

export type ApprovedStudentRow = Pick<
  StudentProfileRow,
  "approval_status" | "profile_id" | "student_id_number"
> & {
  profiles: Pick<
    ProfileRow,
    "email" | "full_name" | "profile_photo_path" | "role"
  > | null;
};
