import type {
  ScheduleUpload,
  ScheduleUploadDetail,
} from "@/modules/schedule/types/schedule-upload";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchScheduleUploadMonth(month: string) {
  const response = await fetch(`/api/schedule/uploads?month=${month}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the schedule files."),
    );
  }

  return (await response.json()) as ScheduleUpload[];
}

export async function fetchScheduleUpload(id: string) {
  const response = await fetch(`/api/schedule/uploads/${id}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the schedule file."),
    );
  }

  return (await response.json()) as ScheduleUploadDetail;
}
