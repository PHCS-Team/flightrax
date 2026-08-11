"use server";

import { deleteCertificateSchema } from "@/modules/auth/schemas/certificate-schema";
import { removeCertificateImages } from "@/modules/auth/utils/certificate";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";

export const deleteCertificateAction = actionClient
  .inputSchema(deleteCertificateSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before deleting a certificate." };
    }

    const adminSupabase = createAdminClient();
    const { data: existing, error: fetchError } = await adminSupabase
      .from("certificates")
      .select("id, image_path")
      .eq("id", parsedInput.certificateId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, message: fetchError.message };
    }

    if (!existing) {
      return { ok: false, message: "Certificate not found." };
    }

    const { error: deleteError } = await adminSupabase
      .from("certificates")
      .delete()
      .eq("id", parsedInput.certificateId)
      .eq("user_id", user.id);

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }

    await removeCertificateImages(supabase, [existing.image_path]);

    return { ok: true, message: "Certificate deleted." };
  });
