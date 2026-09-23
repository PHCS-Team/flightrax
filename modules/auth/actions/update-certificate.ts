"use server";

import { updateCertificateSchema } from "@/modules/auth/schemas/certificate-schema";
import {
  CERTIFICATE_EXTRA_IMAGE_MAX_COUNT,
  removeCertificateImages,
  uploadCertificateImage,
} from "@/modules/auth/utils/certificate";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/types/supabase";
import { describeActionError } from "@/shared/lib/action-error";

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
      .select(
        "id, image_path, certificate_images(id, position, image_path, image_content_type, image_size_bytes, image_uploaded_at)",
      )
      .eq("id", parsedInput.certificateId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, message: describeActionError(fetchError) };
    }

    if (!existing) {
      return { ok: false, message: "Certificate not found." };
    }

    if (!existing.image_path && !parsedInput.image) {
      return { ok: false, message: "Upload a certificate image." };
    }

    const removeIds = new Set(parsedInput.removeImageIds ?? []);
    const currentExtras = [...existing.certificate_images].sort(
      (left, right) => left.position - right.position,
    );
    const keptExtras = currentExtras.filter(
      (image) => !removeIds.has(image.id),
    );
    const removedExtras = currentExtras.filter((image) =>
      removeIds.has(image.id),
    );
    const newFiles = parsedInput.additionalImages ?? [];

    if (
      keptExtras.length + newFiles.length >
      CERTIFICATE_EXTRA_IMAGE_MAX_COUNT
    ) {
      return {
        ok: false,
        message: `A certificate can have a main image plus ${CERTIFICATE_EXTRA_IMAGE_MAX_COUNT} more. Remove one before adding another.`,
      };
    }

    const main = parsedInput.image
      ? await uploadCertificateImage(supabase, user.id, parsedInput.image)
      : null;

    if (parsedInput.image && !main) {
      return { ok: false, message: "Unable to upload the certificate image." };
    }

    const uploadedExtras: {
      path: string;
      content_type: string;
      size_bytes: number;
      uploaded_at: string;
    }[] = [];

    for (const file of newFiles) {
      const image = await uploadCertificateImage(supabase, user.id, file);

      if (!image) {
        await removeCertificateImages(supabase, [
          main?.path,
          ...uploadedExtras.map((uploaded) => uploaded.path),
        ]);

        return {
          ok: false,
          message: "Unable to upload the extra certificate images.",
        };
      }

      uploadedExtras.push(image);
    }

    const extrasChanged = removedExtras.length > 0 || uploadedExtras.length > 0;

    if (extrasChanged) {
      // Positions are unique per certificate, so the extras are rewritten as
      // one set rather than shifted row by row.
      const rows = [
        ...keptExtras.map((image) => ({
          image_path: image.image_path,
          image_content_type: image.image_content_type,
          image_size_bytes: image.image_size_bytes,
          image_uploaded_at: image.image_uploaded_at,
        })),
        ...uploadedExtras.map((image) => ({
          image_path: image.path,
          image_content_type: image.content_type,
          image_size_bytes: image.size_bytes,
          image_uploaded_at: image.uploaded_at,
        })),
      ].map((image, index) => ({
        ...image,
        certificate_id: parsedInput.certificateId,
        position: index + 1,
      }));

      const { error: clearError } = await adminSupabase
        .from("certificate_images")
        .delete()
        .eq("certificate_id", parsedInput.certificateId);

      if (clearError) {
        await removeCertificateImages(supabase, [
          main?.path,
          ...uploadedExtras.map((uploaded) => uploaded.path),
        ]);

        return { ok: false, message: describeActionError(clearError) };
      }

      if (rows.length > 0) {
        const { error: extrasError } = await adminSupabase
          .from("certificate_images")
          .insert(rows);

        if (extrasError) {
          await removeCertificateImages(supabase, [
            main?.path,
            ...uploadedExtras.map((uploaded) => uploaded.path),
          ]);

          return { ok: false, message: describeActionError(extrasError) };
        }
      }
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
        ...(main && {
          image_path: main.path,
          image_content_type: main.content_type,
          image_size_bytes: main.size_bytes,
          image_uploaded_at: main.uploaded_at,
        }),
      };

    const { error: updateError } = await adminSupabase
      .from("certificates")
      .update(updatePayload)
      .eq("id", parsedInput.certificateId)
      .eq("user_id", user.id);

    if (updateError) {
      await removeCertificateImages(supabase, [
        main?.path,
        ...uploadedExtras.map((uploaded) => uploaded.path),
      ]);

      return { ok: false, message: describeActionError(updateError) };
    }

    await removeCertificateImages(supabase, [
      main ? existing.image_path : null,
      ...removedExtras.map((image) => image.image_path),
    ]);

    return { ok: true, message: "Certificate updated." };
  });
