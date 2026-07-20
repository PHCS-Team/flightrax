import "server-only";

import type { AircraftWeightBalance } from "@/modules/aircrafts/types/aircraft-weight-balance";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const WEIGHT_BALANCE_SELECT =
  "id, aircraft_id, basic_empty_weight, arm, moment";

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
    arm: Number(data.arm),
    moment: Number(data.moment),
  };
}
