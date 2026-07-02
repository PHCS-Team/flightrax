"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { getDefaultRedirectForProfile } from "@/shared/lib/rbac/routes";
import { registerBaseProfile } from "@/modules/auth/actions/register-base";
import { getProfileByUserId } from "@/modules/auth/queries/profile";
import { instructorRegisterSchema } from "@/modules/auth/schemas/auth-schema";

export const registerInstructorAction = actionClient
  .inputSchema(instructorRegisterSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await registerBaseProfile({
      email: parsedInput.email,
      password: parsedInput.password,
      fullName: parsedInput.fullName,
      role: ROLE.INSTRUCTOR,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return {
        ok: true,
        message: "Check your email to confirm your account before signing in.",
        redirectTo: `/login/${ROLE.INSTRUCTOR}`,
      };
    }

    const profile = await getProfileByUserId(data.user.id);

    return {
      ok: true,
      message:
        profile?.approval_status === APPROVAL_STATUS.PENDING
          ? "Registration received. Your account is pending approval."
          : "Registration complete.",
      redirectTo: profile
        ? getDefaultRedirectForProfile(profile)
        : `/login/${ROLE.INSTRUCTOR}`,
    };
  });
