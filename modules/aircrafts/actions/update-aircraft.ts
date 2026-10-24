"use server";

import { updateAircraftSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import type {
  AircraftUpdate,
  AircraftWriteResult,
} from "@/modules/aircrafts/types/aircraft";
import {
  AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE,
  AIRCRAFT_VERSION_SELECT,
  toAircraftEditSnapshot,
} from "@/modules/aircrafts/utils/aircraft-conflict";
import { getAircraftPhotoPath } from "@/modules/aircrafts/utils/aircraft-photo";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getAircraftWriteErrorMessage } from "@/modules/aircrafts/utils/aircraft-write-error";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { describeActionError } from "@/shared/lib/action-error";

export const updateAircraftAction = actionClient
  .inputSchema(updateAircraftSchema)
  .action(async ({ parsedInput }): Promise<AircraftWriteResult> => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return {
        ok: false,
        message: "You do not have permission to update aircraft.",
      };
    }

    const supabase = createAdminClient();

    async function getConflictResult(): Promise<AircraftWriteResult> {
      const { data: latest, error: latestError } = await supabase
        .from("aircrafts")
        .select(AIRCRAFT_VERSION_SELECT)
        .eq("id", parsedInput.aircraftId)
        .maybeSingle();

      if (latestError) {
        return { ok: false, message: describeActionError(latestError) };
      }

      if (!latest) {
        return {
          ok: false,
          message: AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE,
          reason: "deleted",
        };
      }

      return {
        ok: false,
        latest: toAircraftEditSnapshot(latest),
        message: `Another user saved changes to ${latest.registration_mark} while you were editing. Your changes were not saved.`,
        reason: "changed",
      };
    }

    const { data: currentAircraft, error: currentAircraftError } =
      await supabase
        .from("aircrafts")
        .select("id, photo_path, updated_at")
        .eq("id", parsedInput.aircraftId)
        .maybeSingle();

    if (currentAircraftError) {
      return { ok: false, message: describeActionError(currentAircraftError) };
    }

    if (
      !currentAircraft ||
      currentAircraft.updated_at !== parsedInput.expectedUpdatedAt
    ) {
      return getConflictResult();
    }

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
        return { ok: false, message: describeActionError(uploadError) };
      }
    }

    async function removeUploadedPhoto() {
      if (newPhotoPath) {
        await supabase.storage
          .from(AIRCRAFT_PHOTOS_BUCKET)
          .remove([newPhotoPath]);
      }
    }

    const updateValues: AircraftUpdate = {
      registration_number: parsedInput.registrationNumber,
      aircraft_type: parsedInput.aircraftType,
      color_markings: parsedInput.colorMarkings,
      registration_mark: parsedInput.registrationMark,
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

    // The updated_at filter makes the version check atomic: a save or delete
    // that lands between the read above and this write matches zero rows.
    const { data: updated, error } = await supabase
      .from("aircrafts")
      .update(updateValues)
      .eq("id", parsedInput.aircraftId)
      .eq("updated_at", parsedInput.expectedUpdatedAt)
      .select("id")
      .maybeSingle();

    if (error) {
      await removeUploadedPhoto();

      return { ok: false, message: getAircraftWriteErrorMessage(error) };
    }

    if (!updated) {
      await removeUploadedPhoto();

      return getConflictResult();
    }

    if (
      newPhotoPath &&
      currentAircraft.photo_path &&
      currentAircraft.photo_path !== newPhotoPath
    ) {
      await supabase.storage
        .from(AIRCRAFT_PHOTOS_BUCKET)
        .remove([currentAircraft.photo_path]);
    }

    return { ok: true, message: "Aircraft saved." };
  });
