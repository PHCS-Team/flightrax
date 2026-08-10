"use server";

import { scryptSync, randomBytes } from "node:crypto";

import { actionClient } from "@/shared/lib/safe-action";
import { canManagePasscode } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { passcodeSchema } from "@/modules/auth/schemas/passcode-schema";

export const savePasscodeAction = actionClient
  .inputSchema(passcodeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before setting a passcode." };
    }

    const { email } = user;
    if (!email) {
      return { ok: false, message: "No email on account." };
    }

    if (parsedInput.currentPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: parsedInput.currentPassword,
      });

      if (signInError) {
        return { ok: false, message: "Current password is incorrect." };
      }
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { ok: false, message: "Profile could not be loaded." };
    }

    if (!canManagePasscode(profile.role)) {
      return {
        ok: false,
        message: "Passcodes are only available to students and instructors.",
      };
    }

    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(parsedInput.passcode, salt, 64).toString("hex");
    const stored = `${salt}:${hash}`;

    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ passcode_hash: stored })
      .eq("id", user.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Passcode saved." };
  });
