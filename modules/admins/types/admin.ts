import type { z } from "zod";

import type { createAdminSchema } from "@/modules/admins/schemas/admin-account-schema";
import type { AdminDepartment } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

// Returned once by create/regenerate — the plaintext is never stored.
export type AdminCredentials = {
  fullName: string;
  email: string;
  tempPassword: string;
};

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

export type AdminAccount = {
  id: string;
  email: string;
  fullName: string;
  department: AdminDepartment | null;
  profilePhotoUrl: string | null;
  mustChangePassword: boolean;
};

export type AdminAccountRow = Pick<
  ProfileRow,
  "id" | "email" | "full_name" | "profile_photo_path" | "must_change_password"
> & {
  admin_profiles: Pick<AdminProfileRow, "department"> | null;
};
