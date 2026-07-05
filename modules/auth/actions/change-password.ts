"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { changePasswordSchema } from "@/modules/auth/schemas/change-password-schema";

export const changePasswordAction = actionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before changing your password." };
    }

    if (!user.email) {
      return { ok: false, message: "No email is available for this account." };
    }

    const { data: reauthenticatedSession, error: currentPasswordError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: parsedInput.currentPassword,
      });

    if (currentPasswordError || reauthenticatedSession.user?.id !== user.id) {
      return { ok: false, message: "Current password is incorrect." };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsedInput.newPassword,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Password changed." };
  });
