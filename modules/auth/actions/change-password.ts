"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { changePasswordSchema } from "@/modules/auth/schemas/auth-schema";

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

    const { error } = await supabase.auth.updateUser({
      password: parsedInput.newPassword,
      current_password: parsedInput.currentPassword,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Password changed." };
  });
