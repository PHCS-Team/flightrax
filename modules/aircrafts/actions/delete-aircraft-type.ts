"use server";

import { deleteAircraftTypeSchema } from "@/modules/aircrafts/schemas/aircraft-type-schema";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const deleteAircraftTypeAction = actionClient
  .inputSchema(deleteAircraftTypeSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to manage aircraft types." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("aircraft_types")
      .delete()
      .eq("type_key", parsedInput.typeKey);

    if (error) {
      if (error.code === "23503") {
        return {
          ok: false,
          message: "This aircraft type is in use and cannot be deleted.",
        };
      }

      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Aircraft type deleted." };
  });
