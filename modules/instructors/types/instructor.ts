import type { CertificateSummary } from "@/shared/types/certificate-summary";
import type { LicenseSummary } from "@/shared/types/license-summary";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRequestRow =
  Database["public"]["Tables"]["account_requests"]["Row"];

export type InstructorUnavailability = {
  id: string;
  startsOn: string;
  endsOn: string;
};

export type ApprovedInstructor = {
  id: string;
  email: string;
  fullName: string;
  instructorIdNumber: string;
  profilePhotoUrl: string | null;
  licenses: LicenseSummary[];
  certificates: CertificateSummary[];
  unavailabilities: InstructorUnavailability[];
};

export type ApprovedInstructorRow = Pick<
  AccountRequestRow,
  "approval_status" | "profile_id" | "id_number"
> & {
  profiles: Pick<
    ProfileRow,
    "email" | "full_name" | "profile_photo_path" | "role"
  > | null;
};
