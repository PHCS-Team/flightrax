"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import { isPublicStudentReviewEnabled } from "@/shared/lib/supabase/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { approveStudentSchema, rejectStudentSchema } from "@/modules/auth/schemas/auth-schema";

const STUDENT_REVIEW_PATH = "/student-review";

function assertPublicReviewEnabled() {
  if (!isPublicStudentReviewEnabled()) {
    throw new Error("Public student review is disabled.");
  }
}

export const approveStudentForReviewAction = actionClient
  .inputSchema(approveStudentSchema)
  .action(async ({ parsedInput }) => {
    assertPublicReviewEnabled();

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("student_profiles")
      .update({
        approval_status: APPROVAL_STATUS.APPROVED,
        approved_at: now,
        approved_by: null,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      })
      .eq("profile_id", parsedInput.studentId);

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath(STUDENT_REVIEW_PATH);

    return { ok: true, message: "Student approved." };
  });

export const rejectStudentForReviewAction = actionClient
  .inputSchema(rejectStudentSchema)
  .action(async ({ parsedInput }) => {
    assertPublicReviewEnabled();

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("student_profiles")
      .update({
        approval_status: APPROVAL_STATUS.REJECTED,
        approved_at: null,
        approved_by: null,
        rejected_at: now,
        rejected_by: null,
        rejection_reason: parsedInput.rejectionReason,
      })
      .eq("profile_id", parsedInput.studentId);

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath(STUDENT_REVIEW_PATH);

    return { ok: true, message: "Student rejected." };
  });
