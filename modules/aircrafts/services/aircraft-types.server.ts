import "server-only";

import type {
  AircraftType,
  AircraftTypeBaggageArea,
} from "@/modules/aircrafts/types/aircraft-type";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const AIRCRAFT_TYPES_SELECT =
  "type_key, type, created_at, usable_fuel_arm, fi_and_student_arm, maximum_takeoff_weight, baggage_area_max_weight, aircraft_type_baggage_areas(id, position, arm)";

export async function getAircraftTypes(): Promise<AircraftType[]> {
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
    .from("aircraft_types")
    .select(AIRCRAFT_TYPES_SELECT)
    .order("type", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    typeKey: row.type_key,
    type: row.type,
    usableFuelArm: row.usable_fuel_arm === null ? null : Number(row.usable_fuel_arm),
    fiAndStudentArm:
      row.fi_and_student_arm === null ? null : Number(row.fi_and_student_arm),
    maximumTakeoffWeight:
      row.maximum_takeoff_weight === null
        ? null
        : Number(row.maximum_takeoff_weight),
    baggageAreaMaxWeight: Number(row.baggage_area_max_weight),
    baggageAreas: (row.aircraft_type_baggage_areas ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((area) => ({
        id: area.id,
        position: area.position,
        arm: Number(area.arm),
      })),
  }));
}

export async function getAircraftTypeBaggageAreas(
  typeKey: string,
): Promise<AircraftTypeBaggageArea[]> {
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
    .from("aircraft_type_baggage_areas")
    .select("id, position, arm")
    .eq("aircraft_type_key", typeKey)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    position: row.position,
    arm: Number(row.arm),
  }));
}
