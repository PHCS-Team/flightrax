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
import { describeActionError } from "@/shared/lib/action-error";
import { duplicateSubmissionCutoff } from "@/shared/lib/duplicate-submission";

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

    if (!parsedInput.image) {
      return { ok: false, message: "Choose a certificate image." };
    }

    const adminSupabase = createAdminClient();
    const { data: duplicate, error: duplicateError } = await adminSupabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", parsedInput.title)
      .gte("created_at", duplicateSubmissionCutoff())
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return { ok: false, message: describeActionError(duplicateError) };
    }

    if (duplicate) {
      return { ok: true, message: "Certificate added." };
    }

    const main = await uploadCertificateImage(
      supabase,
      user.id,
      parsedInput.image,
    );

    if (!main) {
      return { ok: false, message: "Unable to upload the certificate image." };
    }

    const extras: {
      path: string;
      content_type: string;
      size_bytes: number;
      uploaded_at: string;
    }[] = [];

    for (const file of parsedInput.additionalImages ?? []) {
      const image = await uploadCertificateImage(supabase, user.id, file);

      if (!image) {
        await removeCertificateImages(supabase, [
          main.path,
          ...extras.map((uploaded) => uploaded.path),
        ]);

        return {
          ok: false,
          message: "Unable to upload the extra certificate images.",
        };
      }

      extras.push(image);
    }

    const insertPayload: Database["public"]["Tables"]["certificates"]["Insert"] =
      {
        user_id: user.id,
        title: parsedInput.title,
        description: parsedInput.description?.trim() || null,
        has_no_expiry: parsedInput.has_no_expiry,
        expiry_date: parsedInput.has_no_expiry ? null : parsedInput.expiry_date,
        image_path: main.path,
        image_content_type: main.content_type,
        image_size_bytes: main.size_bytes,
        image_uploaded_at: main.uploaded_at,
      };

    const { data: certificate, error: insertError } = await adminSupabase
      .from("certificates")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !certificate) {
      await removeCertificateImages(supabase, [
        main.path,
        ...extras.map((uploaded) => uploaded.path),
      ]);

      return {
        ok: false,
        message: insertError
          ? describeActionError(insertError)
          : "Unable to add the certificate.",
      };
    }

    if (extras.length > 0) {
      const { error: extrasError } = await adminSupabase
        .from("certificate_images")
        .insert(
          extras.map((image, index) => ({
            certificate_id: certificate.id,
            position: index + 1,
            image_path: image.path,
            image_content_type: image.content_type,
            image_size_bytes: image.size_bytes,
            image_uploaded_at: image.uploaded_at,
          })),
        );

      if (extrasError) {
        await adminSupabase
          .from("certificates")
          .delete()
          .eq("id", certificate.id);
        await removeCertificateImages(supabase, [
          main.path,
          ...extras.map((uploaded) => uploaded.path),
        ]);

        return { ok: false, message: describeActionError(extrasError) };
      }
    }

    return { ok: true, message: "Certificate added." };
  });
