"use server";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { ROLE } from "@/shared/lib/rbac/config";
import type { ProfileRole } from "@/shared/lib/rbac/types";
import { createClient } from "@/shared/lib/supabase/server";

const ROLE_LOGIN_PATHS = {
  [ROLE.STUDENT]: "/login/student",
  [ROLE.INSTRUCTOR]: "/login/instructor",
  [ROLE.ADMIN]: "/login/admin",
  [ROLE.SUPERADMIN]: "/login",
} satisfies Record<ProfileRole, string>;

export async function logoutAction() {
  const profile = await getCurrentProfile();
  const loginPath = profile ? ROLE_LOGIN_PATHS[profile.role] : "/login";
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect(`${loginPath}?logout=success`);
}
