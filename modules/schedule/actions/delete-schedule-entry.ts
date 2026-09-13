"use server";

import { deleteScheduleEntrySchema } from "@/modules/schedule/schemas/schedule-schema";
import { getScheduleManager } from "@/modules/schedule/services/schedule-manager.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const deleteScheduleEntryAction = actionClient
  .inputSchema(deleteScheduleEntrySchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to change the schedule.",
      };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("schedule_entries")
      .delete()
      .eq("id", parsedInput.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Entry removed." };
  });
