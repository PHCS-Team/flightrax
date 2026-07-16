"use server";

import { updateStudentLicenseSchema } from "@/modules/students/schemas/student-license-schema";
import type { UpdateStudentLicenseTargetRow } from "@/modules/students/types/student";
import { actionClient } from "@/shared/lib/safe-action";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";

export const updateStudentLicenseAction = actionClient
  .inputSchema(updateStudentLicenseSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before updating student details." };
    }

    const adminSupabase = createAdminClient();
    const { data: actor, error: actorError } = await adminSupabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (actorError) {
      return { ok: false, message: actorError.message };
    }

    if (!actor || (actor.role !== ROLE.INSTRUCTOR && actor.role !== ROLE.SUPERADMIN)) {
      return { ok: false, message: "Only instructors and superadmins can edit student license details." };
    }

    const { data: studentProfile, error: studentError } = await adminSupabase
      .from("student_profiles")
      .select("approval_status, profile_id, profiles!student_profiles_profile_id_fkey(role)")
      .eq("profile_id", parsedInput.studentId)
      .maybeSingle();

    if (studentError) {
      return { ok: false, message: studentError.message };
    }

    const target = studentProfile as UpdateStudentLicenseTargetRow | null;

    if (
      !target ||
      target.approval_status !== APPROVAL_STATUS.APPROVED ||
      target.profiles?.role !== ROLE.STUDENT
    ) {
      return { ok: false, message: "Choose an approved student profile." };
    }

    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({
        license_type: parsedInput.licenseType,
        license_number: parsedInput.licenseNumber,
        rating: parsedInput.rating,
      })
      .eq("id", target.profile_id)
      .eq("role", ROLE.STUDENT);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return {
      ok: true,
      message: "Student license details updated.",
      student: {
        id: target.profile_id,
        licenseType: parsedInput.licenseType,
        licenseNumber: parsedInput.licenseNumber,
        rating: parsedInput.rating,
      },
    };
  });
