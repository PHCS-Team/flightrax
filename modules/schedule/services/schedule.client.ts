import type {
  ScheduleEntry,
  ScheduleTableResponse,
} from "@/modules/schedule/types/schedule";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchScheduleOverview(
  monthKey: string,
): Promise<ScheduleEntry[]> {
  const params = new URLSearchParams({ month: monthKey });
  const response = await fetch(`/api/schedule/overview?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the schedule."),
    );
  }

  const body = (await response.json()) as { entries: ScheduleEntry[] };

  return body.entries;
}

export async function fetchSchedulePage(
  monthKey: string,
  date: string | null,
  page: number,
  pageSize: number,
): Promise<ScheduleTableResponse> {
  const params = new URLSearchParams({
    month: monthKey,
    page: String(page),
    pageSize: String(pageSize),
  });

  if (date) {
    params.set("date", date);
  }

  const response = await fetch(`/api/schedule?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the schedule."),
    );
  }

  return (await response.json()) as ScheduleTableResponse;
}