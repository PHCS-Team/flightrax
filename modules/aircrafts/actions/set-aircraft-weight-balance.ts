"use server";

import { setAircraftWeightBalanceSchema } from "@/modules/aircrafts/schemas/aircraft-weight-balance-schema";
import type { AircraftWriteResult } from "@/modules/aircrafts/types/aircraft";
import { AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE } from "@/modules/aircrafts/utils/aircraft-conflict";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

// Postgres foreign_key_violation: the aircraft was deleted between the
// existence check and the insert.
const FOREIGN_KEY_VIOLATION = "23503";

export const setAircraftWeightBalanceAction = actionClient
  .inputSchema(setAircraftWeightBalanceSchema)
  .action(async ({ parsedInput }): Promise<AircraftWriteResult> => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return {
        ok: false,
        message:
          "You do not have permission to manage aircraft weight and balance.",
      };
    }

    const supabase = createAdminClient();

    const { data: aircraft, error: aircraftError } = await supabase
      .from("aircrafts")
      .select("id")
      .eq("id", parsedInput.aircraftId)
      .maybeSingle();

    if (aircraftError) {
      return { ok: false, message: describeActionError(aircraftError) };
    }

    if (!aircraft) {
      return {
        ok: false,
        message: AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE,
        reason: "deleted",
      };
    }

    const config = {
      basic_empty_weight: parsedInput.basicEmptyWeight,
      basic_empty_weight_arm: parsedInput.basicEmptyWeightArm,
      basic_empty_weight_moment: parsedInput.basicEmptyWeightMoment,
    };

    const { data: existing, error: fetchError } = await supabase
      .from("aircraft_weight_balance_configs")
      .select("id")
      .eq("aircraft_id", parsedInput.aircraftId)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, message: describeActionError(fetchError) };
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

    if (error?.code === FOREIGN_KEY_VIOLATION) {
      return {
        ok: false,
        message: AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE,
        reason: "deleted",
      };
    }

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    return { ok: true, message: "Weight and balance configurations saved." };
  });
