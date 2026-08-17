import "server-only";

import type { AircraftWeightBalance } from "@/modules/aircrafts/types/aircraft-weight-balance";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const WEIGHT_BALANCE_SELECT =
  "id, aircraft_id, basic_empty_weight, basic_empty_weight_arm, basic_empty_weight_moment, usable_fuel_arm, fi_and_student_arm, primary_baggage_area_arm, secondary_baggage_area_arm, maximum_takeoff_weight";

export async function getAircraftWeightBalance(
  aircraftId: string,
): Promise<AircraftWeightBalance | null> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, AIRCRAFTS_VIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to view aircraft.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aircraft_weight_balance_configs")
    .select(WEIGHT_BALANCE_SELECT)
    .eq("aircraft_id", aircraftId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    aircraftId: data.aircraft_id,
    basicEmptyWeight: Number(data.basic_empty_weight),
    basicEmptyWeightArm: Number(data.basic_empty_weight_arm),
    basicEmptyWeightMoment: Number(data.basic_empty_weight_moment),
    usableFuelArm: Number(data.usable_fuel_arm),
    fiAndStudentArm: Number(data.fi_and_student_arm),
    primaryBaggageAreaArm: Number(data.primary_baggage_area_arm),
    secondaryBaggageAreaArm: Number(data.secondary_baggage_area_arm),
    maximumTakeoffWeight: Number(data.maximum_takeoff_weight),
  };
}
