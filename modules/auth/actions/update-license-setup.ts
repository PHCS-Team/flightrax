"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { ROLE } from "@/shared/lib/rbac/config";
import { hasMissingLicenseDetails } from "@/shared/lib/aviation/license-options";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { licenseDetailsSchema } from "@/shared/validations/license-schema";

export const updateLicenseSetupAction = actionClient
  .inputSchema(licenseDetailsSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before updating license details." };
    }

    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, license_number, license_type, rating, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return { ok: false, message: profileError.message };
    }

    if (!profile) {
      return { ok: false, message: "No FlightraX profile exists for this account." };
    }

    if (profile.role !== ROLE.STUDENT && profile.role !== ROLE.INSTRUCTOR) {
      return { ok: false, message: "Only students and instructors can set license details." };
    }

    if (!hasMissingLicenseDetails(profile)) {
      return { ok: false, message: "License details are already set." };
    }

    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({
        license_type: parsedInput.licenseType,
        license_number: parsedInput.licenseNumber,
        rating: parsedInput.rating,
      })
      .eq("id", user.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "License details saved." };
  });
