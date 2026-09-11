"use server";

import { headers } from "next/headers";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { forgotPasswordSchema } from "@/modules/auth/schemas/forgot-password-schema";

export const forgotPasswordAction = actionClient
  .inputSchema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const headerStore = await headers();
    const forwardedProto = headerStore.get("x-forwarded-proto");
    const host =
      headerStore.get("x-forwarded-host") ??
      headerStore.get("host") ??
      "localhost:3000";
    const protocol = forwardedProto?.split(",")[0]?.trim() ?? "http";
    const redirectTo = `${protocol}://${host}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      parsedInput.email,
      { redirectTo },
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };
  });