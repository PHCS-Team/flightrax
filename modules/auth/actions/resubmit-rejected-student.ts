"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { getProfileByUserId } from "@/modules/auth/queries/profile";
import { rejectedStudentResubmissionSchema } from "@/modules/auth/schemas/auth-schema";
import {
  STUDENT_DOCUMENT_BUCKET,
  getStudentIdDocumentPath,
} from "@/modules/auth/utils/student-document";

const PENDING_APPROVAL_PATH = "/pending-approval";
const STUDENT_REVIEW_PATH = "/student-review";

export const resubmitRejectedStudentAction = actionClient
  .inputSchema(rejectedStudentResubmissionSchema)
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
        message: "Sign in again to resubmit your student verification.",
      };
    }

    const profile = await getProfileByUserId(user.id);

    if (!profile) {
      return { ok: false, message: "No FlightraX profile exists for this account." };
    }

    if (
      profile.role !== ROLE.STUDENT ||
      profile.approval_status !== APPROVAL_STATUS.REJECTED
    ) {
      return {
        ok: false,
        message: "Only rejected student profiles can be resubmitted.",
      };
    }

    const adminSupabase = createAdminClient();
    const documentPath = getStudentIdDocumentPath(user.id, parsedInput.studentIdDocument.type);
    const { error: uploadError } = await adminSupabase.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .upload(documentPath, parsedInput.studentIdDocument, {
        contentType: parsedInput.studentIdDocument.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
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

    const { error: studentProfileError } = await adminSupabase
      .from("student_profiles")
      .update({
        student_id_number: parsedInput.studentIdNumber,
        id_document_path: documentPath,
        id_document_content_type: parsedInput.studentIdDocument.type,
        id_document_size_bytes: parsedInput.studentIdDocument.size,
        id_document_uploaded_at: now,
        submitted_at: now,
        approval_status: APPROVAL_STATUS.PENDING,
        approved_at: null,
        approved_by: null,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
        updated_at: now,
      })
      .eq("profile_id", user.id);

    if (studentProfileError) {
      return { ok: false, message: studentProfileError.message };
    }

    revalidatePath(PENDING_APPROVAL_PATH);
    revalidatePath(STUDENT_REVIEW_PATH);

    return {
      ok: true,
      message:
        "Student verification resubmitted. Your account is pending campus approval.",
    };
  });
