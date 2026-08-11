"use server";

import { actionClient } from "@/shared/lib/safe-action";
import {
  APPROVAL_STATUS,
  requiresAccountApproval,
} from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { getProfileAccessByUserId } from "@/modules/auth/queries/profile";
import { rejectedAccountResubmissionSchema } from "@/modules/auth/schemas/rejected-account-resubmission-schema";
import { submitAccountRequest } from "@/modules/auth/services/account-request.server";
import { ACCOUNT_DOCUMENT_BUCKET } from "@/shared/lib/storage/buckets";

export const resubmitRejectedAccountAction = actionClient
  .inputSchema(rejectedAccountResubmissionSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return { ok: false, message: userError.message };
    }

    if (!user) {
      return {
        ok: false,
        message: "Sign in again to resubmit your verification details.",
      };
    }

    const profile = await getProfileAccessByUserId(user.id);

    if (!profile) {
      return { ok: false, message: "No FlightraX profile exists for this account." };
    }

    if (
      !requiresAccountApproval(profile.role) ||
      profile.approval_status !== APPROVAL_STATUS.REJECTED
    ) {
      return {
        ok: false,
        message: "Only rejected account requests can be resubmitted.",
      };
    }

    const adminSupabase = createAdminClient();
    const replacementDocument = parsedInput.idDocument ?? null;
    let oldDocumentPath: string | null = null;

    if (replacementDocument) {
      const { data: currentRequest, error: currentRequestError } =
        await adminSupabase
          .from("account_requests")
          .select("id_document_path")
          .eq("profile_id", user.id)
          .maybeSingle();

      if (currentRequestError) {
        return { ok: false, message: currentRequestError.message };
      }

      oldDocumentPath = currentRequest?.id_document_path ?? null;
    }

    const now = new Date().toISOString();
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        full_name: parsedInput.fullName,
        updated_at: now,
      })
      .eq("id", user.id);

    if (profileError) {
      return { ok: false, message: profileError.message };
    }

    const requestError = await submitAccountRequest({
      userId: user.id,
      role: profile.role,
      idNumber: parsedInput.idNumber,
      idDocument: replacementDocument,
    });

    if (requestError) {
      return { ok: false, message: requestError };
    }

    if (replacementDocument && oldDocumentPath) {
      await adminSupabase.storage
        .from(ACCOUNT_DOCUMENT_BUCKET)
        .remove([oldDocumentPath]);
    }

    return {
      ok: true,
      message:
        "Verification details resubmitted. Your account is pending campus approval.",
    };
  });
