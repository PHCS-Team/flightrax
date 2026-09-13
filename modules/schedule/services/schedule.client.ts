import type {
  ScheduleDay,
  SchedulePersonOption,
} from "@/modules/schedule/types/schedule";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchScheduleDay(date: string) {
  const response = await fetch(`/api/schedule?date=${date}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the schedule."),
    );
  }

  return (await response.json()) as ScheduleDay;
}

export async function fetchSchedulePeople() {
  const response = await fetch("/api/schedule/people", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load people."),
    );
  }

  return (await response.json()) as SchedulePersonOption[];
}
