"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { getDefaultRedirectForProfile } from "@/shared/lib/rbac/routes";
import { registerBaseProfile } from "@/modules/auth/actions/register-base";
import { getProfileAccessByUserId } from "@/modules/auth/queries/profile";
import { adminRegisterSchema } from "@/modules/auth/schemas/auth-schema";

export const registerAdminAction = actionClient
  .inputSchema(adminRegisterSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await registerBaseProfile({
      email: parsedInput.email,
      password: parsedInput.password,
      fullName: parsedInput.fullName,
      role: ROLE.ADMIN,
      adminDepartment: parsedInput.adminDepartment,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return {
        ok: true,
        message: "Check your email to confirm your account before signing in.",
        redirectTo: `/login/${ROLE.ADMIN}`,
      };
    }

    const profile = await getProfileAccessByUserId(data.user.id);

    return {
      ok: true,
      message:
        profile?.approval_status === APPROVAL_STATUS.PENDING
          ? "Registration received. Your account is pending approval."
          : "Registration complete.",
      redirectTo: profile
        ? getDefaultRedirectForProfile(profile)
        : `/login/${ROLE.ADMIN}`,
    };
  });
