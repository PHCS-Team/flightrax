"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { resetPasswordSchema } from "@/modules/auth/schemas/reset-password-schema";

export const resetPasswordAction = actionClient
  .inputSchema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        ok: false,
        message: "Your password reset link is invalid or has expired.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsedInput.password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Your password has been reset." };
  });