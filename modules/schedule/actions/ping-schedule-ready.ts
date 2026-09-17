"use server";

import { pingScheduleReadySchema } from "@/modules/schedule/schemas/schedule-schema";
import { getScheduleManager } from "@/modules/schedule/services/schedule-manager.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";
import { duplicateSubmissionCutoff } from "@/shared/lib/duplicate-submission";

const REPEAT_PING_WINDOW_MS = 60 * 1000;

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
    const { data: recentPing, error: recentPingError } = await supabase
      .from("schedule_pings")
      .select("id")
      .eq("board_date", parsedInput.date)
      .eq("sent_by", actor.id)
      .gte("sent_at", duplicateSubmissionCutoff(REPEAT_PING_WINDOW_MS))
      .limit(1)
      .maybeSingle();

    if (recentPingError) {
      return { ok: false, message: describeActionError(recentPingError) };
    }

    if (recentPing) {
      return {
        ok: true,
        message: "Schedule was already pinged a moment ago.",
      };
    }

    const { data: sent, error } = await supabase.rpc("notify_schedule_ready", {
      p_date: parsedInput.date,
      p_actor_id: actor.id,
    });

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    return {
      ok: true,
      message:
        sent === 1
          ? "Schedule pinged to 1 person."
          : `Schedule pinged to ${sent ?? 0} people.`,
    };
  });
