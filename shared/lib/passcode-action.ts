"use server";

import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { verifyPasscodeSchema } from "@/shared/validations/passcode";

export const verifyPasscodeAction = actionClient
  .inputSchema(verifyPasscodeSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return { ok: false, message: "You do not have permission to do this." };
    }

    return verifyProfilePasscode(actor.id, parsedInput.passcode);
  });
