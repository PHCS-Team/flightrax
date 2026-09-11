"use server";

import { getProfileAccessByUserId } from "@/modules/auth/queries/profile";
import { resetPasswordSchema } from "@/modules/auth/schemas/password-reset-schema";
import { getDefaultRedirectForProfile } from "@/shared/lib/rbac/routes";
import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";

export const resetPasswordAction = actionClient
  .inputSchema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // The session here is the one the email link created via verifyOtp. No
    // session means the link was never followed, or it has expired.
    if (userError || !user) {
      return {
        ok: false,
        message: "This reset link has expired. Request a new one.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsedInput.password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    const profile = await getProfileAccessByUserId(user.id);

    return {
      ok: true,
      message: "Password updated. You are signed in.",
      redirectTo: profile ? getDefaultRedirectForProfile(profile) : "/login",
    };
  });
