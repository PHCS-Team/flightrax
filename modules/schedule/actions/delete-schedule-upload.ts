"use server";

import { deleteScheduleUploadSchema } from "@/modules/schedule/schemas/schedule-upload-schema";
import { getScheduleManager } from "@/modules/schedule/services/schedule-manager.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { SCHEDULE_FILES_BUCKET } from "@/shared/lib/storage/buckets";
import { describeActionError } from "@/shared/lib/action-error";

export const deleteScheduleUploadAction = actionClient
  .inputSchema(deleteScheduleUploadSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to remove schedule files.",
      };
    }

    const supabase = createAdminClient();
    const { data: upload, error: lookupError } = await supabase
      .from("schedule_uploads")
      .select("storage_path")
      .eq("id", parsedInput.id)
      .maybeSingle();

    if (lookupError) {
      return { ok: false, message: describeActionError(lookupError) };
    }

    if (!upload) {
      return { ok: false, message: "This schedule file no longer exists." };
    }

    const { error: deleteError } = await supabase
      .from("schedule_uploads")
      .delete()
      .eq("id", parsedInput.id);

    if (deleteError) {
      return { ok: false, message: describeActionError(deleteError) };
    }

    await supabase.storage
      .from(SCHEDULE_FILES_BUCKET)
      .remove([upload.storage_path]);

    return { ok: true, message: "Schedule file removed." };
  });
