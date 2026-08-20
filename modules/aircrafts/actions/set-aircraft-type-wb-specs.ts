"use server";

import { setAircraftTypeWbSpecsSchema } from "@/modules/aircrafts/schemas/aircraft-type-schema";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const setAircraftTypeWbSpecsAction = actionClient
  .inputSchema(setAircraftTypeWbSpecsSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return {
        ok: false,
        message: "You do not have permission to manage aircraft types.",
      };
    }

    const supabase = createAdminClient();

    const { data: aircraftType, error: updateError } = await supabase
      .from("aircraft_types")
      .update({
        usable_fuel_arm: parsedInput.usableFuelArm,
        fi_and_student_arm: parsedInput.fiAndStudentArm,
        maximum_takeoff_weight: parsedInput.maximumTakeoffWeight,
        baggage_area_max_weight: parsedInput.baggageAreaMaxWeight,
      })
      .eq("type_key", parsedInput.typeKey)
      .select("type_key")
      .maybeSingle();

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    if (!aircraftType) {
      return { ok: false, message: "Choose an existing aircraft type." };
    }

    const { error: deleteError } = await supabase
      .from("aircraft_type_baggage_areas")
      .delete()
      .eq("aircraft_type_key", parsedInput.typeKey);

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }

    if (parsedInput.baggageAreas.length > 0) {
      const { error: insertError } = await supabase
        .from("aircraft_type_baggage_areas")
        .insert(
          parsedInput.baggageAreas.map((area, index) => ({
            aircraft_type_key: parsedInput.typeKey,
            position: index + 1,
            arm: area.arm,
          })),
        );

      if (insertError) {
        return { ok: false, message: insertError.message };
      }
    }

    return { ok: true, message: "Weight and balance specifications saved." };
  });
