"use server";

import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import { actionClient } from "@/shared/lib/safe-action";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { APPROVAL_STATUS, hasPermission } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { isApproved } from "@/shared/lib/rbac/guards";
import {
  approveAccountRequestSchema,
  rejectAccountRequestSchema,
} from "@/modules/account-review/schemas/account-review-schema";

async function getAuthorizedReviewer() {
  const profile = await getCurrentAuthorizationProfile();

  if (!profile || !isApproved(profile)) {
    return null;
  }

  if (!hasPermission(profile.role, ACCOUNT_REVIEW, profile.admin_department)) {
    return null;
  }

  return profile;
}

export const approveAccountRequestAction = actionClient
  .inputSchema(approveAccountRequestSchema)
  .action(async ({ parsedInput }) => {
    const reviewer = await getAuthorizedReviewer();

    if (!reviewer) {
      return {
        ok: false,
        message: "You do not have permission to review account requests.",
      };
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("account_requests")
      .update({
        approval_status: APPROVAL_STATUS.APPROVED,
        approved_at: now,
        approved_by: reviewer.id,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      })
      .eq("profile_id", parsedInput.requestId)
      .in("approval_status", [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REJECTED])
      .select("profile_id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "This account request has already been reviewed." };
    }

    return {
      ok: true,
      message: "Account request approved.",
      requestId: parsedInput.requestId,
      approvalStatus: APPROVAL_STATUS.APPROVED,
    };
  });

export const rejectAccountRequestAction = actionClient
  .inputSchema(rejectAccountRequestSchema)
  .action(async ({ parsedInput }) => {
    const reviewer = await getAuthorizedReviewer();

    if (!reviewer) {
      return {
        ok: false,
        message: "You do not have permission to review account requests.",
      };
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("account_requests")
      .update({
        approval_status: APPROVAL_STATUS.REJECTED,
        approved_at: null,
        approved_by: null,
        rejected_at: now,
        rejected_by: reviewer.id,
        rejection_reason: parsedInput.rejectionReason,
      })
      .eq("profile_id", parsedInput.requestId)
      .eq("approval_status", APPROVAL_STATUS.PENDING)
      .select("profile_id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "This account request has already been reviewed." };
    }

    return {
      ok: true,
      message: "Account request rejected.",
      requestId: parsedInput.requestId,
      approvalStatus: APPROVAL_STATUS.REJECTED,
      rejectionReason: parsedInput.rejectionReason,
      rejectedAt: now,
    };
  });
