import "server-only";

import { requireScheduleViewer } from "@/modules/schedule/services/schedule.server";
import type {
  ScheduleSheetGrid,
  ScheduleUpload,
  ScheduleUploadDetail,
} from "@/modules/schedule/types/schedule-upload";
import { monthBounds } from "@/modules/schedule/utils/schedule-month";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { SCHEDULE_FILES_BUCKET } from "@/shared/lib/storage/buckets";
import { describeActionError } from "@/shared/lib/action-error";

const UPLOAD_SELECT =
  "id, label, file_name, size_bytes, starts_on, ends_on, sheet_count, created_at, profiles!schedule_uploads_uploaded_by_fkey(full_name)";

const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

type UploadRowWithUploader = {
  id: string;
  label: string | null;
  file_name: string;
  size_bytes: number;
  starts_on: string;
  ends_on: string;
  sheet_count: number;
  created_at: string;
  profiles: { full_name: string } | null;
};

function toUpload(row: UploadRowWithUploader): ScheduleUpload {
  return {
    id: row.id,
    label: row.label,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    sheetCount: row.sheet_count,
    uploadedByName: row.profiles?.full_name ?? null,
    createdAt: row.created_at,
  };
}

// Every upload whose range touches the month, newest first so a revised
// file for the same week lists above the one it replaces.
export async function getScheduleUploadMonth(
  month: string,
): Promise<ScheduleUpload[]> {
  await requireScheduleViewer();

  const { first, last } = monthBounds(month);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("schedule_uploads")
    .select(UPLOAD_SELECT)
    .lte("starts_on", last)
    .gte("ends_on", first)
    .order("starts_on", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(describeActionError(error));
  }

  return (data ?? []).map(toUpload);
}

export async function getScheduleUpload(
  id: string,
): Promise<ScheduleUploadDetail | null> {
  await requireScheduleViewer();

  const supabase = createAdminClient();
  const [uploadResult, sheetsResult] = await Promise.all([
    supabase
      .from("schedule_uploads")
      .select(`${UPLOAD_SELECT}, storage_path`)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("schedule_upload_sheets")
      .select("id, position, name, board_date, grid")
      .eq("upload_id", id)
      .order("position", { ascending: true }),
  ]);

  if (uploadResult.error) {
    throw new Error(describeActionError(uploadResult.error));
  }

  if (!uploadResult.data) {
    return null;
  }

  if (sheetsResult.error) {
    throw new Error(describeActionError(sheetsResult.error));
  }

  const { data: signed } = await supabase.storage
    .from(SCHEDULE_FILES_BUCKET)
    .createSignedUrl(uploadResult.data.storage_path, DOWNLOAD_URL_TTL_SECONDS, {
      download: uploadResult.data.file_name,
    });

  return {
    ...toUpload(uploadResult.data),
    downloadUrl: signed?.signedUrl ?? null,
    sheets: (sheetsResult.data ?? []).map((row) => ({
      id: row.id,
      position: row.position,
      name: row.name,
      boardDate: row.board_date,
      grid: row.grid as unknown as ScheduleSheetGrid,
    })),
  };
}
