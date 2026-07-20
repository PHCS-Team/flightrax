"use server";

import { createAircraftSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import { getAircraftPhotoPath } from "@/modules/aircrafts/utils/aircraft-photo";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";

export const createAircraftAction = actionClient
  .inputSchema(createAircraftSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to create aircraft." };
    }

    const supabase = createAdminClient();
    const aircraftId = crypto.randomUUID();
    const photoPath = parsedInput.photo
      ? getAircraftPhotoPath(aircraftId, parsedInput.photo.type)
      : null;

    if (parsedInput.photo && photoPath) {
      const { error: uploadError } = await supabase.storage
        .from(AIRCRAFT_PHOTOS_BUCKET)
        .upload(photoPath, parsedInput.photo, {
          contentType: parsedInput.photo.type,
          upsert: false,
        });

      if (uploadError) {
        return { ok: false, message: uploadError.message };
      }
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("aircrafts").insert({
      aircraft_identification: parsedInput.aircraftIdentification,
      aircraft_type: parsedInput.aircraftType,
      color_markings: parsedInput.colorMarkings,
      id: aircraftId,
      model: parsedInput.model,
      photo_content_type: parsedInput.photo?.type ?? null,
      photo_path: photoPath,
      photo_size_bytes: parsedInput.photo?.size ?? null,
      photo_uploaded_at: parsedInput.photo ? now : null,
      remarks: parsedInput.remarks?.trim() || null,
      serial_number: parsedInput.serialNumber?.trim() || null,
      status: parsedInput.status,
    });

    if (error) {
      if (photoPath) {
        await supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET).remove([photoPath]);
      }

      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Aircraft created." };
  });
