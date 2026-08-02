"use server";

import { createLicenseSchema } from "@/modules/auth/schemas/license-schema";
import {
  removeLicenseImages,
  uploadLicenseImage,
} from "@/modules/auth/utils/license";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import type { Database } from "@/shared/types/supabase";

export const createLicenseAction = actionClient
  .inputSchema(createLicenseSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before adding a license." };
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

    const insertPayload: Database["public"]["Tables"]["licenses"]["Insert"] = {
      user_id: user.id,
      license_type: parsedInput.license_type,
      license_number: parsedInput.license_number,
      ratings: parsedInput.ratings?.map((value) => value.trim()) ?? [],
      has_no_expiry: parsedInput.has_no_expiry,
      expiry_date: parsedInput.has_no_expiry
        ? null
        : parsedInput.expiry_date,
      status: parsedInput.status ?? "active",
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

    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from("licenses")
      .insert(insertPayload);

    if (insertError) {
      await removeLicenseImages(supabase, [idFront?.path, idBack?.path]);

      return { ok: false, message: insertError.message };
    }

    return { ok: true, message: "License added." };
  });
