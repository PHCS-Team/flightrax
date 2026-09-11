"use server";

import { requestPasswordResetSchema } from "@/modules/auth/schemas/password-reset-schema";
import { getRequestOrigin } from "@/modules/auth/utils/request-origin";
import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";

// Deliberately the same answer whether or not the address has an account:
// a different message would tell anyone which emails are registered.
const NEUTRAL_MESSAGE =
  "If an account exists for that email, a reset link is on its way.";

export const requestPasswordResetAction = actionClient
  .inputSchema(requestPasswordResetSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const origin = await getRequestOrigin();

    // The email template appends token_hash and type to this URL (see
    // docs/PASSWORD-RESET-SETUP.md), so it must be plain — no query string.
    // It also has to be on the project's redirect allowlist, or Supabase
    // silently swaps it for the Site URL and the link lands on the home page.
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsedInput.email,
      { redirectTo: `${origin}/api/auth/confirm` },
    );

    if (error) {
      if (error.status === 429 || /rate limit/i.test(error.message)) {
        return {
          ok: false,
          message: "Too many reset requests. Wait a few minutes and try again.",
        };
      }

      // Anything else (SMTP misconfigured, provider down) is an operator
      // problem, not the user's — log it for the deployment logs and still
      // answer neutrally so the response cannot be used to probe accounts.
      console.error("[password-reset] resetPasswordForEmail failed:", error.message);
    }

    return { ok: true, message: NEUTRAL_MESSAGE };
  });
