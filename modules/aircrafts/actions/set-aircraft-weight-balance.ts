"use server";

import { setAircraftWeightBalanceSchema } from "@/modules/aircrafts/schemas/aircraft-weight-balance-schema";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const setAircraftWeightBalanceAction = actionClient
  .inputSchema(setAircraftWeightBalanceSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return {
        ok: false,
        message: "You do not have permission to manage aircraft weight and balance.",
      };
    }

    const supabase = createAdminClient();

    const { data: aircraft, error: aircraftError } = await supabase
      .from("aircrafts")
      .select("id")
      .eq("id", parsedInput.aircraftId)
      .maybeSingle();

    if (aircraftError) {
      return { ok: false, message: aircraftError.message };
    }

    if (!aircraft) {
      return { ok: false, message: "Choose an existing aircraft." };
    }

    const config = {
      basic_empty_weight: parsedInput.basicEmptyWeight,
      arm: parsedInput.arm,
      moment: parsedInput.moment,
    };

    const { data: existing, error: fetchError } = await supabase
      .from("aircraft_weight_balance_configs")
      .select("id")
      .eq("aircraft_id", parsedInput.aircraftId)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, message: fetchError.message };
    }

    let error;

    if (existing) {
      const { error: updateError } = await supabase
        .from("aircraft_weight_balance_configs")
        .update(config)
        .eq("aircraft_id", parsedInput.aircraftId);

      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("aircraft_weight_balance_configs")
        .insert({ aircraft_id: parsedInput.aircraftId, ...config });

      error = insertError;
    }

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Weight and balance configuration saved." };
  });
