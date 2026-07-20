"use server";

import { updateAircraftSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import type { AircraftRow, AircraftUpdate } from "@/modules/aircrafts/types/aircraft";
import { getAircraftPhotoPath } from "@/modules/aircrafts/utils/aircraft-photo";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";

export const updateAircraftAction = actionClient
  .inputSchema(updateAircraftSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to update aircraft." };
    }

    const supabase = createAdminClient();
    const { data: currentAircraft, error: currentAircraftError } = await supabase
      .from("aircrafts")
      .select("id, photo_path")
      .eq("id", parsedInput.aircraftId)
      .maybeSingle();

    if (currentAircraftError) {
      return { ok: false, message: currentAircraftError.message };
    }

    if (!currentAircraft) {
      return { ok: false, message: "Choose an existing aircraft." };
    }

    const target = currentAircraft satisfies Pick<AircraftRow, "id" | "photo_path">;
    const newPhotoPath = parsedInput.photo
      ? getAircraftPhotoPath(parsedInput.aircraftId, parsedInput.photo.type)
      : null;

    if (parsedInput.photo && newPhotoPath) {
      const { error: uploadError } = await supabase.storage
        .from(AIRCRAFT_PHOTOS_BUCKET)
        .upload(newPhotoPath, parsedInput.photo, {
          contentType: parsedInput.photo.type,
          upsert: false,
        });

      if (uploadError) {
        return { ok: false, message: uploadError.message };
      }
    }

    const updateValues: AircraftUpdate = {
      aircraft_identification: parsedInput.aircraftIdentification,
      aircraft_type: parsedInput.aircraftType,
      color_markings: parsedInput.colorMarkings,
      model: parsedInput.model,
      remarks: parsedInput.remarks?.trim() || null,
      serial_number: parsedInput.serialNumber?.trim() || null,
      status: parsedInput.status,
    };

    if (parsedInput.photo && newPhotoPath) {
      updateValues.photo_content_type = parsedInput.photo.type;
      updateValues.photo_path = newPhotoPath;
      updateValues.photo_size_bytes = parsedInput.photo.size;
      updateValues.photo_uploaded_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("aircrafts")
      .update(updateValues)
      .eq("id", parsedInput.aircraftId);

    if (error) {
      if (newPhotoPath) {
        await supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET).remove([newPhotoPath]);
      }

      return { ok: false, message: error.message };
    }

    if (newPhotoPath && target.photo_path && target.photo_path !== newPhotoPath) {
      await supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET).remove([target.photo_path]);
    }

    return { ok: true, message: "Aircraft saved." };
  });
