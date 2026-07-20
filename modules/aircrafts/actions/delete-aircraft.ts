"use server";

import { deleteAircraftSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import type { AircraftRow } from "@/modules/aircrafts/types/aircraft";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";

export const deleteAircraftAction = actionClient
  .inputSchema(deleteAircraftSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to delete aircraft." };
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
    const { error } = await supabase
      .from("aircrafts")
      .delete()
      .eq("id", parsedInput.aircraftId);

    if (error) {
      return { ok: false, message: error.message };
    }

    if (target.photo_path) {
      await supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET).remove([target.photo_path]);
    }

    return { ok: true, message: "Aircraft deleted." };
  });
