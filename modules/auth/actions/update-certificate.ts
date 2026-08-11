"use server";

import { updateCertificateSchema } from "@/modules/auth/schemas/certificate-schema";
import {
  removeCertificateImages,
  uploadCertificateImage,
} from "@/modules/auth/utils/certificate";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/types/supabase";

export const updateCertificateAction = actionClient
  .inputSchema(updateCertificateSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before updating a certificate." };
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

    if (!existing.image_path && !parsedInput.image) {
      return { ok: false, message: "Upload a certificate image." };
    }

    const image = parsedInput.image
      ? await uploadCertificateImage(supabase, user.id, parsedInput.image)
      : null;

    if (parsedInput.image && !image) {
      return { ok: false, message: "Unable to upload the certificate image." };
    }

    const updatePayload: Database["public"]["Tables"]["certificates"]["Update"] =
      {
        ...(parsedInput.title !== undefined && {
          title: parsedInput.title,
        }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description.trim() || null,
        }),
        ...(parsedInput.has_no_expiry !== undefined && {
          has_no_expiry: parsedInput.has_no_expiry,
          ...(parsedInput.has_no_expiry && { expiry_date: null }),
        }),
        ...(parsedInput.expiry_date !== undefined &&
          !parsedInput.has_no_expiry && {
            expiry_date: parsedInput.expiry_date.trim()
              ? parsedInput.expiry_date
              : null,
          }),
        ...(image && {
          image_path: image.path,
          image_content_type: image.content_type,
          image_size_bytes: image.size_bytes,
          image_uploaded_at: image.uploaded_at,
        }),
      };

    const { error: updateError } = await adminSupabase
      .from("certificates")
      .update(updatePayload)
      .eq("id", parsedInput.certificateId)
      .eq("user_id", user.id);

    if (updateError) {
      await removeCertificateImages(supabase, [image?.path]);

      return { ok: false, message: updateError.message };
    }

    await removeCertificateImages(supabase, [
      image ? existing.image_path : null,
    ]);

    return { ok: true, message: "Certificate updated." };
  });
