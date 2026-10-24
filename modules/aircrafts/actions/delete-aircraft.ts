"use server";

import { deleteAircraftSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import type { AircraftWriteResult } from "@/modules/aircrafts/types/aircraft";
import {
  AIRCRAFT_VERSION_SELECT,
  toAircraftEditSnapshot,
} from "@/modules/aircrafts/utils/aircraft-conflict";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { describeActionError } from "@/shared/lib/action-error";

// Postgres foreign_key_violation. flight_plans and weight_balances keep
// their aircraft_id without ON DELETE, so a filed plan blocks the delete.
const FOREIGN_KEY_VIOLATION = "23503";

export const deleteAircraftAction = actionClient
  .inputSchema(deleteAircraftSchema)
  .action(async ({ parsedInput }): Promise<AircraftWriteResult> => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return {
        ok: false,
        message: "You do not have permission to delete aircraft.",
      };
    }

    const supabase = createAdminClient();

    async function getConflictResult(): Promise<AircraftWriteResult> {
      const { data: latest, error: latestError } = await supabase
        .from("aircrafts")
        .select(AIRCRAFT_VERSION_SELECT)
        .eq("id", parsedInput.aircraftId)
        .maybeSingle();

      if (latestError) {
        return { ok: false, message: describeActionError(latestError) };
      }

      if (!latest) {
        return {
          ok: true,
          message: "This aircraft was already deleted by another user.",
        };
      }

      return {
        ok: false,
        latest: toAircraftEditSnapshot(latest),
        message: `Another user changed ${latest.registration_mark} after you opened this. Review the latest details, then delete it again if you still want to.`,
        reason: "changed",
      };
    }

    const { data: deleted, error } = await supabase
      .from("aircrafts")
      .delete()
      .eq("id", parsedInput.aircraftId)
      .eq("updated_at", parsedInput.expectedUpdatedAt)
      .select("photo_path, registration_mark")
      .maybeSingle();

    if (error?.code === FOREIGN_KEY_VIOLATION) {
      const { data: target } = await supabase
        .from("aircrafts")
        .select("registration_mark")
        .eq("id", parsedInput.aircraftId)
        .maybeSingle();

      return {
        ok: false,
        message: `${target?.registration_mark ?? "This aircraft"} cannot be deleted because flight plans were filed with it. Set its status to Retired instead to take it out of service and keep its flight history.`,
        reason: "in-use",
      };
    }

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    if (!deleted) {
      return getConflictResult();
    }

    if (deleted.photo_path) {
      await supabase.storage
        .from(AIRCRAFT_PHOTOS_BUCKET)
        .remove([deleted.photo_path]);
    }

    return { ok: true, message: `${deleted.registration_mark} deleted.` };
  });
