"use server";

import { updateScheduleEntrySchema } from "@/modules/schedule/schemas/schedule-schema";
import {
  describeScheduleWriteError,
  getScheduleManager,
} from "@/modules/schedule/services/schedule-manager.server";
import { toInstant } from "@/modules/schedule/utils/schedule-time";
import { SCHEDULE_SESSION_TYPE_META } from "@/modules/schedule/constants/session-types";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const updateScheduleEntryAction = actionClient
  .inputSchema(updateScheduleEntrySchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to change the schedule.",
      };
    }

    const needsPeople =
      SCHEDULE_SESSION_TYPE_META[parsedInput.sessionType].needsPeople;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("schedule_entries")
      .update({
        starts_at: toInstant(parsedInput.date, parsedInput.startTime),
        ends_at: toInstant(parsedInput.date, parsedInput.endTime),
        session_type: parsedInput.sessionType,
        pilot_profile_id: needsPeople
          ? parsedInput.pilotProfileId || null
          : null,
        instructor_profile_id: needsPeople
          ? parsedInput.instructorProfileId || null
          : null,
        label: needsPeople ? null : parsedInput.label || null,
      })
      .eq("id", parsedInput.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: describeScheduleWriteError(error) };
    }

    if (!data) {
      return { ok: false, message: "This entry no longer exists." };
    }

    return { ok: true, message: "Entry updated." };
  });
