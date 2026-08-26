import "server-only";

import type { WeightBalanceFormValues } from "@/modules/flight-documents/schemas/weight-balance-schema";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import type {
  BalanceStatus,
  WeightBalanceContext,
  WeightBalanceGivens,
} from "@/modules/flight-documents/types/weight-balance";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const WEIGHT_BALANCE_CONTEXT_SELECT =
  "id, aircraft_id, aircraft_identification, type_of_aircraft, aircraft_color_and_marking, created_by, flight_requests(id, status, weight_balance_id), aircrafts(model, photo_path, aircraft_weight_balance_configs(basic_empty_weight, basic_empty_weight_arm, basic_empty_weight_moment), aircraft_types!inner(type, usable_fuel_arm, fi_and_student_arm, maximum_takeoff_weight, baggage_area_max_weight, aircraft_type_baggage_areas(position, arm)))";

export async function getWeightBalanceContext(
  flightPlanId: string,
): Promise<WeightBalanceContext | null> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view weight and balance.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("flight_plans")
    .select(WEIGHT_BALANCE_CONTEXT_SELECT)
    .eq("id", flightPlanId)
    .eq("created_by", viewer.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.flight_requests) {
    return null;
  }

  const aircraftRow = data.aircrafts;
  const config = aircraftRow?.aircraft_weight_balance_configs;
  const type = aircraftRow?.aircraft_types;
  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  const givens: WeightBalanceGivens | null =
    config &&
    type &&
    type.usable_fuel_arm !== null &&
    type.fi_and_student_arm !== null &&
    type.maximum_takeoff_weight !== null
      ? {
          basicEmptyWeight: Number(config.basic_empty_weight),
          basicEmptyWeightArm: Number(config.basic_empty_weight_arm),
          basicEmptyWeightMoment: Number(config.basic_empty_weight_moment),
          usableFuelArm: Number(type.usable_fuel_arm),
          fiAndStudentArm: Number(type.fi_and_student_arm),
          baggageAreas: type.aircraft_type_baggage_areas
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((area) => ({
              position: area.position,
              arm: Number(area.arm),
            })),
          maximumTakeoffWeight: Number(type.maximum_takeoff_weight),
          baggageAreaMaxWeight: Number(type.baggage_area_max_weight),
        }
      : null;

  let existing: WeightBalanceFormValues | null = null;

  if (data.flight_requests.weight_balance_id) {
    const { data: weightBalance, error: wbError } = await supabase
      .from("weight_balances")
      .select(
        "usable_fuel_weight, usable_fuel_moment, fi_and_student_weight, fi_and_student_moment, balance_status, weight_balance_baggage_entries(position, weight, moment)",
      )
      .eq("id", data.flight_requests.weight_balance_id)
      .maybeSingle();

    if (wbError) {
      throw new Error(wbError.message);
    }

    if (weightBalance) {
      const entriesByPosition = new Map(
        weightBalance.weight_balance_baggage_entries.map((entry) => [
          entry.position,
          entry,
        ]),
      );

      existing = {
        usableFuelWeight:
          weightBalance.usable_fuel_weight === null
            ? ""
            : String(weightBalance.usable_fuel_weight),
        usableFuelMoment:
          weightBalance.usable_fuel_moment === null
            ? ""
            : String(weightBalance.usable_fuel_moment),
        fiAndStudentWeight:
          weightBalance.fi_and_student_weight === null
            ? ""
            : String(weightBalance.fi_and_student_weight),
        fiAndStudentMoment:
          weightBalance.fi_and_student_moment === null
            ? ""
            : String(weightBalance.fi_and_student_moment),
        // Align saved entries to the type's current baggage areas.
        baggageEntries: (givens?.baggageAreas ?? []).map((area) => {
          const entry = entriesByPosition.get(area.position);

          return {
            position: area.position,
            weight: entry ? String(entry.weight) : "0",
            moment: entry?.moment !== null && entry?.moment !== undefined
              ? String(entry.moment)
              : "0",
          };
        }),
        balanceStatus:
          (weightBalance.balance_status as BalanceStatus | null) ?? "balanced",
      };
    }
  }

  return {
    flightPlanId: data.id,
    requestId: data.flight_requests.id,
    requestStatus: data.flight_requests.status as FlightRequestStatus,
    weightBalanceId: data.flight_requests.weight_balance_id,
    aircraft: {
      id: data.aircraft_id ?? data.id,
      aircraftIdentification: data.aircraft_identification,
      model: aircraftRow?.model ?? "",
      typeKey: data.type_of_aircraft,
      typeName: type?.type ?? data.type_of_aircraft,
      colorMarkings: data.aircraft_color_and_marking,
      photoUrl: aircraftRow?.photo_path
        ? storage.getPublicUrl(aircraftRow.photo_path).data.publicUrl
        : null,
      isAvailable: true,
      unavailableReason: null,
    },
    givens,
    existing,
  };
}
