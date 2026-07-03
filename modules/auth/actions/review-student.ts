"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, hasPermission } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { isApproved } from "@/shared/lib/rbac/guards";
import { getCurrentAuthorizationProfile } from "@/modules/auth/queries/profile";
import { approveStudentSchema, rejectStudentSchema } from "@/modules/auth/schemas/auth-schema";

async function getAuthorizedReviewer() {
  const profile = await getCurrentAuthorizationProfile();

  if (!profile || !isApproved(profile)) {
    return null;
  }

  if (!hasPermission(profile.role, "students.review", profile.admin_department)) {
    return null;
  }

  return profile;
}

export const approveStudentForReviewAction = actionClient
  .inputSchema(approveStudentSchema)
  .action(async ({ parsedInput }) => {
    const reviewer = await getAuthorizedReviewer();

    if (!reviewer) {
      return { ok: false, message: "You do not have permission to review students." };
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("student_profiles")
      .update({
        approval_status: APPROVAL_STATUS.APPROVED,
        approved_at: now,
        approved_by: reviewer.id,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      })
      .eq("profile_id", parsedInput.studentId)
      .in("approval_status", [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REJECTED])
      .select("profile_id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "This student request has already been reviewed." };
    }

    return {
      ok: true,
      message: "Student approved.",
      studentId: parsedInput.studentId,
      approvalStatus: APPROVAL_STATUS.APPROVED,
    };
  });

export const rejectStudentForReviewAction = actionClient
  .inputSchema(rejectStudentSchema)
  .action(async ({ parsedInput }) => {
    const reviewer = await getAuthorizedReviewer();

    if (!reviewer) {
      return { ok: false, message: "You do not have permission to review students." };
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("student_profiles")
      .update({
        approval_status: APPROVAL_STATUS.REJECTED,
        approved_at: null,
        approved_by: null,
        rejected_at: now,
        rejected_by: reviewer.id,
        rejection_reason: parsedInput.rejectionReason,
      })
      .eq("profile_id", parsedInput.studentId)
      .eq("approval_status", APPROVAL_STATUS.PENDING)
      .select("profile_id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "This student request has already been reviewed." };
    }

    return {
      ok: true,
      message: "Student rejected.",
      studentId: parsedInput.studentId,
      approvalStatus: APPROVAL_STATUS.REJECTED,
      rejectionReason: parsedInput.rejectionReason,
      rejectedAt: now,
    };
  });
