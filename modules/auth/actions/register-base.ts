"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type { AdminDepartment, ProfileRole } from "@/shared/lib/rbac/types";

type RegisterBaseProfileInput = {
  email: string;
  password: string;
  fullName: string;
  role: ProfileRole;
  adminDepartment?: AdminDepartment;
};

export async function registerBaseProfile(input: RegisterBaseProfileInput) {
  const supabase = await createClient();

  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        requested_role: input.role,
        admin_department: input.adminDepartment ?? "",
      },
    },
  });
}
