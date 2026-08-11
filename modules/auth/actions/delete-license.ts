"use server";

import { deleteLicenseSchema } from "@/modules/auth/schemas/license-schema";
import { removeLicenseImages } from "@/modules/auth/utils/license";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";

export const deleteLicenseAction = actionClient
  .inputSchema(deleteLicenseSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before deleting a license." };
    }

    const adminSupabase = createAdminClient();
    const { data: existing, error: fetchError } = await adminSupabase
      .from("licenses")
      .select("id, id_front_path, id_back_path")
      .eq("id", parsedInput.licenseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, message: fetchError.message };
    }

    if (!existing) {
      return { ok: false, message: "License not found." };
    }

    const { error: deleteError } = await adminSupabase
      .from("licenses")
      .delete()
      .eq("id", parsedInput.licenseId)
      .eq("user_id", user.id);

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }

    await removeLicenseImages(supabase, [
      existing.id_front_path,
      existing.id_back_path,
    ]);

    return { ok: true, message: "License deleted." };
  });
