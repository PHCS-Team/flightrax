"use server";

import { pingScheduleReadySchema } from "@/modules/schedule/schemas/schedule-schema";
import { getScheduleManager } from "@/modules/schedule/services/schedule-manager.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const pingScheduleReadyAction = actionClient
  .inputSchema(pingScheduleReadySchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to ping the schedule.",
      };
    }

    const supabase = createAdminClient();
    const { data: sent, error } = await supabase.rpc("notify_schedule_ready", {
      p_date: parsedInput.date,
      p_actor_id: actor.id,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message:
        sent === 1
          ? "Schedule pinged to 1 person."
          : `Schedule pinged to ${sent ?? 0} people.`,
    };
  });
