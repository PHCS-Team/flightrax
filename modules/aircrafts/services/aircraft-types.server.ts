import "server-only";

import type { AircraftType } from "@/modules/aircrafts/types/aircraft-type";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const AIRCRAFT_TYPES_SELECT = "type_key, type, created_at";

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
  }));
}
