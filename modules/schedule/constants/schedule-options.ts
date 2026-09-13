import { MINUTES_PER_DAY } from "@/modules/schedule/utils/schedule-time";

export const SCHEDULE_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const STEP_MINUTES = 30;

function buildTimeOptions(includeEndOfDay: boolean): string[] {
  const count = MINUTES_PER_DAY / STEP_MINUTES + (includeEndOfDay ? 1 : 0);

  return Array.from({ length: count }, (_, index) => {
    const minutes = index * STEP_MINUTES;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  });
}

export const SCHEDULE_START_TIME_OPTIONS = buildTimeOptions(false);
export const SCHEDULE_END_TIME_OPTIONS = buildTimeOptions(true);

export const SCHEDULE_FIRST_VISIBLE_HOUR = 6;
