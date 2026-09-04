import "server-only";

import { getOwnFlightPlanForEdit } from "@/modules/flight-documents/services/flight-plans.server";
import type { PilotLicenseSnapshot } from "@/modules/flight-documents/types/flight-plan";
import type {
  FlightDocumentsExport,
  WeightBalanceExport,
} from "@/modules/flight-documents/types/flight-documents-export";
import type {
  BalanceStatus,
  WeightStatus,
} from "@/modules/flight-documents/types/weight-balance";
import { toLicenseShortForm } from "@/modules/flight-documents/utils/format-license-line";
import { getRatingOptions } from "@/shared/lib/aviation/rating-options.server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const EXPORT_SELECT =
  "plan_code, dof_resolved, updated_at, pilot_signature, pilot_licenses, authorized_representative_name, authorized_representative_signature, authorized_representative_licenses, aircraft_type_designator, flight_requests(weight_balance_id)";

const WEIGHT_BALANCE_EXPORT_SELECT =
  "basic_empty_weight, basic_empty_weight_arm, basic_empty_weight_moment, usable_fuel_weight, usable_fuel_arm, usable_fuel_moment, fi_and_student_weight, fi_and_student_arm, fi_and_student_moment, total_weight, total_moment, total_cg, maximum_takeoff_weight, max_baggage_weight, weight_status, balance_status, prepared_by_name, prepared_by_signature, verified_by_name, verified_by_signature, updated_at, weight_balance_baggage_entries(position, weight, arm, moment)";

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function toLicenseSnapshots(value: unknown): PilotLicenseSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return [];
    }

    const record = entry as Record<string, unknown>;

    if (
      typeof record.licenseType !== "string" ||
      typeof record.licenseNumber !== "string"
    ) {
      return [];
    }

    return [
      {
        licenseType: record.licenseType,
        licenseNumber: record.licenseNumber,
        ratings: Array.isArray(record.ratings)
          ? record.ratings.filter(
              (rating): rating is string => typeof rating === "string",
            )
          : [],
        expiryDate:
          typeof record.expiryDate === "string" ? record.expiryDate : null,
        hasNoExpiry: record.hasNoExpiry === true,
        status: record.status as PilotLicenseSnapshot["status"],
      },
    ];
  });
}

// Access follows getOwnFlightPlanForEdit: the filer, reviewers, and
// admins holding the flight plans permission. Returns null when the plan
// is missing or the viewer may not see it.
export async function getFlightDocumentsExport(
  flightPlanId: string,
): Promise<FlightDocumentsExport | null> {
  const flightPlan = await getOwnFlightPlanForEdit(flightPlanId);

  if (!flightPlan) {
    return null;
  }

  const supabase = createAdminClient();
  const ratingOptions = await getRatingOptions();
  const { data, error } = await supabase
    .from("flight_plans")
    .select(EXPORT_SELECT)
    .eq("id", flightPlanId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  let weightBalance: WeightBalanceExport | null = null;
  const weightBalanceId = data.flight_requests?.weight_balance_id ?? null;

  if (weightBalanceId) {
    const { data: sheet, error: sheetError } = await supabase
      .from("weight_balances")
      .select(WEIGHT_BALANCE_EXPORT_SELECT)
      .eq("id", weightBalanceId)
      .maybeSingle();

    if (sheetError) {
      throw new Error(sheetError.message);
    }

    if (sheet) {
      weightBalance = {
        registrationMark: flightPlan.aircraft.registrationMark,
        aircraftTypeName: flightPlan.aircraft.typeName,
        date: data.dof_resolved ?? sheet.updated_at,
        basicEmptyWeight: Number(sheet.basic_empty_weight),
        basicEmptyWeightArm: Number(sheet.basic_empty_weight_arm),
        basicEmptyWeightMoment: Number(sheet.basic_empty_weight_moment),
        usableFuelWeight: toNumberOrNull(sheet.usable_fuel_weight),
        usableFuelArm: toNumberOrNull(sheet.usable_fuel_arm),
        usableFuelMoment: toNumberOrNull(sheet.usable_fuel_moment),
        fiAndStudentWeight: toNumberOrNull(sheet.fi_and_student_weight),
        fiAndStudentArm: toNumberOrNull(sheet.fi_and_student_arm),
        fiAndStudentMoment: toNumberOrNull(sheet.fi_and_student_moment),
        baggage: sheet.weight_balance_baggage_entries
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((entry) => ({
            position: entry.position,
            weight: Number(entry.weight),
            arm: toNumberOrNull(entry.arm),
            moment: toNumberOrNull(entry.moment),
          })),
        totalWeight: toNumberOrNull(sheet.total_weight),
        totalMoment: toNumberOrNull(sheet.total_moment),
        totalCg: toNumberOrNull(sheet.total_cg),
        maximumTakeoffWeight: toNumberOrNull(sheet.maximum_takeoff_weight),
        maxBaggageWeight: toNumberOrNull(sheet.max_baggage_weight),
        weightStatus: (sheet.weight_status as WeightStatus | null) ?? null,
        balanceStatus: (sheet.balance_status as BalanceStatus | null) ?? null,
        preparedByName: sheet.prepared_by_name,
        preparedBySignatureSvg: sheet.prepared_by_signature,
        verifiedByName: sheet.verified_by_name,
        verifiedBySignatureSvg: sheet.verified_by_signature,
      };
    }
  }

  return {
    flightPlan: {
      planCode: data.plan_code,
      requestStatus: flightPlan.requestStatus,
      aircraftIdentification: flightPlan.aircraft.registrationMark,
      aircraftTypeName: flightPlan.aircraft.typeName,
      aircraftTypeDesignator: data.aircraft_type_designator ?? "",
      aircraftColorMarkings: flightPlan.aircraft.colorMarkings,
      filedByName: flightPlan.filedByName,
      pilotSignatureSvg: data.pilot_signature,
      pilotLicenses: toLicenseSnapshots(data.pilot_licenses).map((license) =>
        toLicenseShortForm(license, ratingOptions),
      ),
      representativeName: data.authorized_representative_name,
      representativeSignatureSvg: data.authorized_representative_signature,
      representativeLicenses: toLicenseSnapshots(
        data.authorized_representative_licenses,
      ).map((license) => toLicenseShortForm(license, ratingOptions)),
      values: flightPlan.values,
    },
    weightBalance,
  };
}
