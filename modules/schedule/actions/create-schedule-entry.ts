"use server";

import { createScheduleEntrySchema } from "@/modules/schedule/schemas/schedule-schema";
import {
  describeScheduleWriteError,
  getScheduleManager,
  isScheduleEntryAlreadyPosted,
  SCHEDULE_OVERLAP_VIOLATION,
} from "@/modules/schedule/services/schedule-manager.server";
import { toInstant } from "@/modules/schedule/utils/schedule-time";
import { SCHEDULE_SESSION_TYPE_META } from "@/modules/schedule/constants/session-types";
import { actionClient } from "@/shared/lib/safe-action";
import { findExpiredCredentialBlock } from "@/shared/lib/aviation/expired-credentials.server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const createScheduleEntryAction = actionClient
  .inputSchema(createScheduleEntrySchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to post to the schedule.",
      };
    }

    const needsPeople =
      SCHEDULE_SESSION_TYPE_META[parsedInput.sessionType].needsPeople;
    if (needsPeople) {
      const credentialBlock = await findExpiredCredentialBlock([
        { id: parsedInput.pilotProfileId, role: "pilot" },
        { id: parsedInput.instructorProfileId, role: "instructor" },
      ]);

      if (credentialBlock) {
        return { ok: false, message: credentialBlock };
      }
    }

    const supabase = createAdminClient();
    const entry = {
      aircraft_id: parsedInput.aircraftId,
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
      created_by: actor.id,
    };
    const { error } = await supabase.from("schedule_entries").insert(entry);

    if (error) {
      if (
        error.code === SCHEDULE_OVERLAP_VIOLATION &&
        (await isScheduleEntryAlreadyPosted(entry))
      ) {
        return { ok: true, message: "Entry posted." };
      }

      return { ok: false, message: describeScheduleWriteError(error) };
    }

    return { ok: true, message: "Entry posted." };
  });
