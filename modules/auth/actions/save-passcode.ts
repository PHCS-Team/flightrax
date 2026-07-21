"use server";

import { scryptSync, randomBytes } from "node:crypto";

import { actionClient } from "@/shared/lib/safe-action";
import { createClient } from "@/shared/lib/supabase/server";
import { passcodeSchema } from "@/modules/auth/schemas/instructor-passcode-schema";

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

    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(parsedInput.passcode, salt, 64).toString("hex");
    const stored = `${salt}:${hash}`;

    const { error: updateError } = await supabase
      .from("instructor_profiles")
      .update({ passcode_hash: stored })
      .eq("profile_id", user.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Passcode saved." };
  });
