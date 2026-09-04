import "server-only";

import { buildRatingOptions } from "@/shared/lib/aviation/ratings";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { RatingOption } from "@/shared/types/rating-option";

export async function getRatingOptions(): Promise<RatingOption[]> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view ratings.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aircraft_types")
    .select("type_key, type, icao_designator")
    .order("type", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildRatingOptions(
    (data ?? []).map((row) => ({
      typeKey: row.type_key,
      type: row.type,
      icaoDesignator: row.icao_designator,
    })),
  );
}
