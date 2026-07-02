"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import { getDefaultRedirectForProfile } from "@/shared/lib/rbac/routes";
import { loginSchema } from "@/modules/auth/schemas/auth-schema";
import { getProfileByUserId } from "@/modules/auth/queries/profile";

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return { ok: false, message: "Unable to load the authenticated user." };
    }

    const profile = await getProfileByUserId(data.user.id);

    if (!profile) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "No FlightraX profile exists for this account.",
      };
    }

    if (profile.role !== parsedInput.role) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Use the login page for your assigned role.",
      };
    }

    if (profile.approval_status !== APPROVAL_STATUS.APPROVED) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Your student account is still pending campus approval.",
        redirectTo: "/pending-approval",
      };
    }

    return {
      ok: true,
      message: "Signed in.",
      redirectTo: getDefaultRedirectForProfile(profile),
    };
  });
