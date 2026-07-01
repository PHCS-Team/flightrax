"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { studentRegisterSchema } from "@/modules/auth/schemas/auth-schema";
import { getProfileByUserId } from "@/modules/auth/queries/profile";
import { registerBaseProfile } from "@/modules/auth/actions/register-base";
import {
  STUDENT_DOCUMENT_BUCKET,
  getStudentIdDocumentPath,
} from "@/modules/auth/utils/student-document";

export const registerStudentAction = actionClient
  .inputSchema(studentRegisterSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await registerBaseProfile({
      email: parsedInput.email,
      password: parsedInput.password,
      fullName: parsedInput.fullName,
      role: ROLE.STUDENT,
      licenseType: parsedInput.licenseType,
      licenseNumber: parsedInput.licenseNumber,
      rating: parsedInput.rating,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return {
        ok: true,
        message: "Check your email to confirm your account before signing in.",
        redirectTo: `/login/${ROLE.STUDENT}`,
      };
    }

    const adminSupabase = createAdminClient();
    const documentPath = getStudentIdDocumentPath(data.user.id, parsedInput.studentIdDocument.type);
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
      })
      .eq("profile_id", data.user.id);

    if (studentProfileError) {
      return { ok: false, message: studentProfileError.message };
    }

    const profile = await getProfileByUserId(data.user.id);

    return {
      ok: true,
      message:
        profile?.approval_status === APPROVAL_STATUS.PENDING
          ? "Registration received. Your student account is pending approval."
          : "Registration complete.",
      redirectTo: "/pending-approval",
    };
  });
