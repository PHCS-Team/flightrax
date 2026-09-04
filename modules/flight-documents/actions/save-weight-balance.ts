"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { saveWeightBalanceSchema } from "@/modules/flight-documents/schemas/weight-balance-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const saveWeightBalanceAction = actionClient
  .inputSchema(saveWeightBalanceSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to file weight and balance.",
      };
    }

    if (!actor.signature_svg?.trim()) {
      return {
        ok: false,
        message:
          "Set your signature in account settings before filing a weight and balance.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planError } = await supabase
      .from("flight_plans")
      .select(
        "id, aircraft_id, created_by, flight_requests(id, status, weight_balance_id), aircrafts(aircraft_type, aircraft_weight_balance_configs(basic_empty_weight, basic_empty_weight_arm, basic_empty_weight_moment), aircraft_types!inner(usable_fuel_arm, fi_and_student_arm, maximum_takeoff_weight, baggage_area_max_weight))",
      )
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: planError.message };
    }

    if (!flightPlan || flightPlan.created_by !== actor.id) {
      return { ok: false, message: "Flight plan not found." };
    }

    const request = flightPlan.flight_requests;

    if (
      !request ||
      !EDITABLE_FLIGHT_REQUEST_STATUSES.some(
        (status) => status === request.status,
      )
    ) {
      return {
        ok: false,
        message:
          "Weight and balance can only be filed while the request is a draft or rejected.",
      };
    }

    const config = flightPlan.aircrafts?.aircraft_weight_balance_configs;
    const type = flightPlan.aircrafts?.aircraft_types;

    if (
      !config ||
      !type ||
      type.usable_fuel_arm === null ||
      type.fi_and_student_arm === null ||
      type.maximum_takeoff_weight === null
    ) {
      return {
        ok: false,
        message:
          "The aircraft's weight and balance configuration is incomplete — contact your admin.",
      };
    }

    // Totals are computed server-side from the submitted values plus the
    // given basic empty weight figures.
    const basicEmptyWeight = Number(config.basic_empty_weight);
    const basicEmptyWeightMoment = Number(config.basic_empty_weight_moment);
    const usableFuelWeight = Number(parsedInput.usableFuelWeight);
    const usableFuelMoment = Number(parsedInput.usableFuelMoment);
    const fiAndStudentWeight = Number(parsedInput.fiAndStudentWeight);
    const fiAndStudentMoment = Number(parsedInput.fiAndStudentMoment);
    const baggageWeight = parsedInput.baggageEntries.reduce(
      (sum, entry) => sum + Number(entry.weight),
      0,
    );
    const baggageMoment = parsedInput.baggageEntries.reduce(
      (sum, entry) => sum + Number(entry.moment),
      0,
    );

    const totalWeight =
      basicEmptyWeight + usableFuelWeight + fiAndStudentWeight + baggageWeight;
    const totalMoment =
      basicEmptyWeightMoment +
      usableFuelMoment +
      fiAndStudentMoment +
      baggageMoment;
    const totalCg = totalWeight > 0 ? totalMoment / totalWeight : 0;
    const maximumTakeoffWeight = Number(type.maximum_takeoff_weight);

    const weightBalanceRow = {
      aircraft_id: flightPlan.aircraft_id,
      basic_empty_weight: basicEmptyWeight,
      basic_empty_weight_arm: Number(config.basic_empty_weight_arm),
      basic_empty_weight_moment: basicEmptyWeightMoment,
      usable_fuel_weight: usableFuelWeight,
      usable_fuel_arm: Number(type.usable_fuel_arm),
      usable_fuel_moment: usableFuelMoment,
      fi_and_student_weight: fiAndStudentWeight,
      fi_and_student_arm: Number(type.fi_and_student_arm),
      fi_and_student_moment: fiAndStudentMoment,
      total_weight: Number(totalWeight.toFixed(2)),
      total_cg: Number(totalCg.toFixed(2)),
      total_moment: Number(totalMoment.toFixed(2)),
      maximum_takeoff_weight: maximumTakeoffWeight,
      max_baggage_weight: Number(type.baggage_area_max_weight),
      weight_status:
        totalWeight <= maximumTakeoffWeight ? "within_limits" : "overweight",
      balance_status: parsedInput.balanceStatus,
      prepared_by_id: actor.id,
      prepared_by_name: actor.full_name.toUpperCase(),
      prepared_by_signature: actor.signature_svg,
    };

    let weightBalanceId = request.weight_balance_id;

    if (weightBalanceId) {
      const { error: updateError } = await supabase
        .from("weight_balances")
        .update(weightBalanceRow)
        .eq("id", weightBalanceId);

      if (updateError) {
        return { ok: false, message: updateError.message };
      }
    } else {
      const { data: created, error: insertError } = await supabase
        .from("weight_balances")
        .insert({ ...weightBalanceRow, created_by: actor.id })
        .select("id")
        .single();

      if (insertError) {
        return { ok: false, message: insertError.message };
      }

      weightBalanceId = created.id;

      const { error: linkError } = await supabase
        .from("flight_requests")
        .update({ weight_balance_id: weightBalanceId })
        .eq("id", request.id);

      if (linkError) {
        // Keep the pair consistent: an unlinked W&B row would be orphaned.
        await supabase
          .from("weight_balances")
          .delete()
          .eq("id", weightBalanceId);

        return { ok: false, message: linkError.message };
      }
    }

    // Replace the dynamic baggage entries; arms snapshot the type's
    // current configuration.
    const { error: entriesDeleteError } = await supabase
      .from("weight_balance_baggage_entries")
      .delete()
      .eq("weight_balance_id", weightBalanceId);

    if (entriesDeleteError) {
      return { ok: false, message: entriesDeleteError.message };
    }

    if (parsedInput.baggageEntries.length > 0) {
      const { data: typeAreas, error: areasError } = await supabase
        .from("aircraft_type_baggage_areas")
        .select("position, arm")
        .eq("aircraft_type_key", flightPlan.aircrafts?.aircraft_type ?? "");

      if (areasError) {
        return { ok: false, message: areasError.message };
      }

      const armsByPosition = new Map(
        (typeAreas ?? []).map((area) => [area.position, Number(area.arm)]),
      );

      const { error: entriesInsertError } = await supabase
        .from("weight_balance_baggage_entries")
        .insert(
          parsedInput.baggageEntries.map((entry) => ({
            weight_balance_id: weightBalanceId,
            position: entry.position,
            weight: Number(entry.weight),
            arm: armsByPosition.get(entry.position) ?? null,
            moment: Number(entry.moment),
          })),
        );

      if (entriesInsertError) {
        return { ok: false, message: entriesInsertError.message };
      }
    }

    return { ok: true, message: "Weight and balance saved." };
  });
