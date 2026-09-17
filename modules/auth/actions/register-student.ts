"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { ROLE } from "@/shared/lib/rbac/config";
import { studentRegisterSchema } from "@/modules/auth/schemas/register-schema";
import { registerBaseProfile } from "@/modules/auth/actions/register-base";
import {
  idNumberTakenMessage,
  isIdNumberRegistered,
  submitAccountRequest,
} from "@/modules/auth/services/account-request.server";
import {
  EXISTING_ACCOUNT_MESSAGE,
  isExistingAccountSignUp,
} from "@/modules/auth/utils/sign-up";
import { describeActionError } from "@/shared/lib/action-error";

export const registerStudentAction = actionClient
  .inputSchema(studentRegisterSchema)
  .action(async ({ parsedInput }) => {
    if (await isIdNumberRegistered(ROLE.STUDENT, parsedInput.idNumber)) {
      return { ok: false, message: idNumberTakenMessage(ROLE.STUDENT) };
    }

    const { data, error } = await registerBaseProfile({
      email: parsedInput.email,
      password: parsedInput.password,
      fullName: parsedInput.fullName,
      role: ROLE.STUDENT,
    });

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    if (!data.user) {
      return {
        ok: true,
        message: "Check your email to confirm your account before signing in.",
        redirectTo: `/login/${ROLE.STUDENT}`,
      };
    }

    if (isExistingAccountSignUp(data.user)) {
      return { ok: false, message: EXISTING_ACCOUNT_MESSAGE };
    }

    const requestError = await submitAccountRequest({
      userId: data.user.id,
      role: ROLE.STUDENT,
      idNumber: parsedInput.idNumber,
      idDocument: parsedInput.idDocument,
    });

    if (requestError) {
      return { ok: false, message: requestError };
    }

    return {
      ok: true,
      message:
        "Registration received. Your student account is pending approval.",
      redirectTo: "/pending-approval",
    };
  });
