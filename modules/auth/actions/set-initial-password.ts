"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { setInitialPasswordSchema } from "@/modules/auth/schemas/change-password-schema";
import { describeActionError } from "@/shared/lib/action-error";

// Replaces the seeded default password without asking for it — the
// account is flagged as still using the default, so retyping it proves
// nothing. Only accounts carrying the flag may use this action.
export const setInitialPasswordAction = actionClient
  .inputSchema(setInitialPasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before changing your password." };
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { ok: false, message: "Your profile could not be loaded." };
    }

    if (!profile.must_change_password) {
      return {
        ok: false,
        message: "Use Change Password in account settings instead.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsedInput.newPassword,
    });

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    const { error: flagError } = await admin
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);

    if (flagError) {
      console.error("must_change_password could not be cleared:", flagError);
    }

    return { ok: true, message: "Password changed." };
  });
