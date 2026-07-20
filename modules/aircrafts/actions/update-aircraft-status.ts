"use server";

import { updateAircraftStatusSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const updateAircraftStatusAction = actionClient
  .inputSchema(updateAircraftStatusSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to update aircraft." };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("aircrafts")
      .update({ status: parsedInput.status })
      .eq("id", parsedInput.aircraftId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: "Choose an existing aircraft." };
    }

    return { ok: true, message: "Aircraft status updated." };
  });
