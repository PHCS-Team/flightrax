"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { getProfileAccessByUserId } from "@/modules/auth/queries/profile";
import { rejectedStudentResubmissionSchema } from "@/modules/auth/schemas/rejected-student-resubmission-schema";
import { getStudentIdDocumentPath } from "@/modules/auth/utils/student-document";
import { STUDENT_DOCUMENT_BUCKET } from "@/shared/lib/storage/buckets";

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

    const profile = await getProfileAccessByUserId(user.id);

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
    const { data: currentStudentProfile, error: currentStudentProfileError } =
      await adminSupabase
        .from("student_profiles")
        .select("id_document_path")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (currentStudentProfileError) {
      return { ok: false, message: currentStudentProfileError.message };
    }

    const oldDocumentPath = currentStudentProfile?.id_document_path ?? null;
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
      await adminSupabase.storage.from(STUDENT_DOCUMENT_BUCKET).remove([documentPath]);

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
      await adminSupabase.storage.from(STUDENT_DOCUMENT_BUCKET).remove([documentPath]);

      return { ok: false, message: studentProfileError.message };
    }

    if (oldDocumentPath && oldDocumentPath !== documentPath) {
      await adminSupabase.storage.from(STUDENT_DOCUMENT_BUCKET).remove([oldDocumentPath]);
    }

    return {
      ok: true,
      message:
        "Student verification resubmitted. Your account is pending campus approval.",
    };
  });
