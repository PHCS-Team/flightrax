"use server";

import { updateLicenseSchema } from "@/modules/auth/schemas/license-schema";
import {
  removeLicenseImages,
  uploadLicenseImage,
} from "@/modules/auth/utils/license";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/types/supabase";

export const updateLicenseAction = actionClient
  .inputSchema(updateLicenseSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before updating a license." };
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

    if (!existing.id_front_path && !parsedInput.idFront) {
      return { ok: false, message: "Upload an ID front photo." };
    }

    if (!existing.id_back_path && !parsedInput.idBack) {
      return { ok: false, message: "Upload an ID back photo." };
    }

    const idFront = parsedInput.idFront
      ? await uploadLicenseImage(supabase, user.id, "front", parsedInput.idFront)
      : null;

    if (parsedInput.idFront && !idFront) {
      return { ok: false, message: "Unable to upload the ID front photo." };
    }

    const idBack = parsedInput.idBack
      ? await uploadLicenseImage(supabase, user.id, "back", parsedInput.idBack)
      : null;

    if (parsedInput.idBack && !idBack) {
      await removeLicenseImages(supabase, idFront ? [idFront.path] : []);

      return { ok: false, message: "Unable to upload the ID back photo." };
    }

    const updatePayload: Database["public"]["Tables"]["licenses"]["Update"] = {
      ...(parsedInput.license_type !== undefined && {
        license_type: parsedInput.license_type,
      }),
      ...(parsedInput.license_number !== undefined && {
        license_number: parsedInput.license_number,
      }),
      ...(parsedInput.ratings !== undefined && {
        ratings: parsedInput.ratings.map((value) => value.trim()),
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
      ...(parsedInput.status !== undefined && {
        status: parsedInput.status,
      }),
      ...(idFront && {
        id_front_path: idFront.path,
        id_front_content_type: idFront.content_type,
        id_front_size_bytes: idFront.size_bytes,
        id_front_uploaded_at: idFront.uploaded_at,
      }),
      ...(idBack && {
        id_back_path: idBack.path,
        id_back_content_type: idBack.content_type,
        id_back_size_bytes: idBack.size_bytes,
        id_back_uploaded_at: idBack.uploaded_at,
      }),
    };

    const { error: updateError } = await adminSupabase
      .from("licenses")
      .update(updatePayload)
      .eq("id", parsedInput.licenseId)
      .eq("user_id", user.id);

    if (updateError) {
      await removeLicenseImages(supabase, [idFront?.path, idBack?.path]);

      return { ok: false, message: updateError.message };
    }

    await removeLicenseImages(supabase, [
      idFront ? existing.id_front_path : null,
      idBack ? existing.id_back_path : null,
    ]);

    return { ok: true, message: "License updated." };
  });
