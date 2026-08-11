"use server";

import { createCertificateSchema } from "@/modules/auth/schemas/certificate-schema";
import {
  removeCertificateImages,
  uploadCertificateImage,
} from "@/modules/auth/utils/certificate";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/types/supabase";

export const createCertificateAction = actionClient
  .inputSchema(createCertificateSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before adding a certificate." };
    }

    const image = parsedInput.image
      ? await uploadCertificateImage(supabase, user.id, parsedInput.image)
      : null;

    if (parsedInput.image && !image) {
      return { ok: false, message: "Unable to upload the certificate image." };
    }

    const insertPayload: Database["public"]["Tables"]["certificates"]["Insert"] =
      {
        user_id: user.id,
        title: parsedInput.title,
        description: parsedInput.description?.trim() || null,
        has_no_expiry: parsedInput.has_no_expiry,
        expiry_date: parsedInput.has_no_expiry ? null : parsedInput.expiry_date,
        ...(image && {
          image_path: image.path,
          image_content_type: image.content_type,
          image_size_bytes: image.size_bytes,
          image_uploaded_at: image.uploaded_at,
        }),
      };

    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from("certificates")
      .insert(insertPayload);

    if (insertError) {
      await removeCertificateImages(supabase, [image?.path]);

      return { ok: false, message: insertError.message };
    }

    return { ok: true, message: "Certificate added." };
  });
