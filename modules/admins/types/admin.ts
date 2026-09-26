import type { AdminDepartment } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

export type AdminAccount = {
  id: string;
  email: string;
  fullName: string;
  department: AdminDepartment | null;
  profilePhotoUrl: string | null;
};

export type AdminAccountRow = Pick<
  ProfileRow,
  "id" | "email" | "full_name" | "profile_photo_path"
> & {
  admin_profiles: Pick<AdminProfileRow, "department"> | null;
};
