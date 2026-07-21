"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { updateSignatureSchema } from "@/modules/auth/schemas/signature-schema";

export const saveSignatureAction = actionClient
  .inputSchema(updateSignatureSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before saving your signature." };
    }

    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ signature_svg: parsedInput.signature })
      .eq("id", user.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Signature saved." };
  });
