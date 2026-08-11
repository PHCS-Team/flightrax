"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { ROLE } from "@/shared/lib/rbac/config";
import { instructorRegisterSchema } from "@/modules/auth/schemas/register-schema";
import { registerBaseProfile } from "@/modules/auth/actions/register-base";
import { submitAccountRequest } from "@/modules/auth/services/account-request.server";

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

    const requestError = await submitAccountRequest({
      userId: data.user.id,
      role: ROLE.INSTRUCTOR,
      idNumber: parsedInput.idNumber,
      idDocument: parsedInput.idDocument,
    });

    if (requestError) {
      return { ok: false, message: requestError };
    }

    return {
      ok: true,
      message:
        "Registration received. Your instructor account is pending approval.",
      redirectTo: "/pending-approval",
    };
  });
