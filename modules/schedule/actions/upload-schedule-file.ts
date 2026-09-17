"use server";

import { SCHEDULE_FILE_CONTENT_TYPE } from "@/modules/schedule/constants/schedule-upload";
import { uploadScheduleFileSchema } from "@/modules/schedule/schemas/schedule-upload-schema";
import { getScheduleManager } from "@/modules/schedule/services/schedule-manager.server";
import { parseScheduleWorkbook } from "@/modules/schedule/utils/schedule-workbook.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { SCHEDULE_FILES_BUCKET } from "@/shared/lib/storage/buckets";
import { describeActionError } from "@/shared/lib/action-error";
import { duplicateSubmissionCutoff } from "@/shared/lib/duplicate-submission";

function safeFileName(name: string): string {
  const base = name.replace(/\.xlsx$/i, "").replace(/[^A-Za-z0-9._-]+/g, "-");

  return `${base.replace(/^-+|-+$/g, "") || "schedule"}.xlsx`;
}

export const uploadScheduleFileAction = actionClient
  .inputSchema(uploadScheduleFileSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getScheduleManager();

    if (!actor) {
      return {
        ok: false,
        message: "You do not have permission to upload schedule files.",
      };
    }

    const supabase = createAdminClient();
    const fileName = safeFileName(parsedInput.file.name);
    const { data: duplicateUpload, error: duplicateError } = await supabase
      .from("schedule_uploads")
      .select("id")
      .eq("uploaded_by", actor.id)
      .eq("file_name", fileName)
      .eq("starts_on", parsedInput.startsOn)
      .eq("ends_on", parsedInput.endsOn)
      .eq("size_bytes", parsedInput.file.size)
      .gte("created_at", duplicateSubmissionCutoff())
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return { ok: false, message: describeActionError(duplicateError) };
    }

    if (duplicateUpload) {
      return { ok: true, message: "This schedule file is already uploaded." };
    }

    const bytes = await parsedInput.file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let sheets;

    try {
      sheets = await parseScheduleWorkbook(bytes, {
        startsOn: parsedInput.startsOn,
        endsOn: parsedInput.endsOn,
      });
    } catch (error) {
      console.error("[schedule-upload] parse failed", error);

      return {
        ok: false,
        message:
          "That file could not be read. Save it from Excel as .xlsx and try again.",
      };
    }

    if (sheets.length === 0) {
      return {
        ok: false,
        message: "That workbook has no sheets with anything on them.",
      };
    }

    const uploadId = crypto.randomUUID();
    const storagePath = `${uploadId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(SCHEDULE_FILES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: SCHEDULE_FILE_CONTENT_TYPE,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: describeActionError(uploadError) };
    }

    const { error: insertError } = await supabase
      .from("schedule_uploads")
      .insert({
        id: uploadId,
        label: parsedInput.label || null,
        file_name: fileName,
        storage_path: storagePath,
        content_type: SCHEDULE_FILE_CONTENT_TYPE,
        size_bytes: buffer.byteLength,
        starts_on: parsedInput.startsOn,
        ends_on: parsedInput.endsOn,
        sheet_count: sheets.length,
        uploaded_by: actor.id,
      });

    if (insertError) {
      await supabase.storage.from(SCHEDULE_FILES_BUCKET).remove([storagePath]);

      return {
        ok: false,
        message:
          insertError.code === "23P01"
            ? "Another file already covers some of those dates. Remove it first or change the range."
            : describeActionError(insertError),
      };
    }

    const { error: sheetsError } = await supabase
      .from("schedule_upload_sheets")
      .insert(
        sheets.map((sheet) => ({
          upload_id: uploadId,
          position: sheet.position,
          name: sheet.name,
          board_date: sheet.boardDate,
          grid: sheet.grid,
        })),
      );

    if (sheetsError) {
      await supabase.from("schedule_uploads").delete().eq("id", uploadId);
      await supabase.storage.from(SCHEDULE_FILES_BUCKET).remove([storagePath]);

      return { ok: false, message: describeActionError(sheetsError) };
    }

    const { data: sent, error: notifyError } = await supabase.rpc(
      "notify_schedule_file_uploaded",
      { p_upload_id: uploadId },
    );

    if (notifyError) {
      console.error("[schedule-upload] notify failed", notifyError);
    }

    const notified =
      sent === 1
        ? "1 person notified."
        : sent
          ? `${sent} people notified.`
          : "";

    return {
      ok: true,
      message: [
        sheets.length === 1
          ? "Schedule file uploaded with 1 sheet."
          : `Schedule file uploaded with ${sheets.length} sheets.`,
        notified,
      ]
        .filter(Boolean)
        .join(" "),
    };
  });
