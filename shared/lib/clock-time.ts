import { format } from "date-fns";

// Crews read military time, so every clock time in the app carries its
// 24-hour equivalent: "5:08 PM (17:08)". Compose the pattern into a larger
// format string when the call site also shows a date.
export const CLOCK_TIME_PATTERN = "h:mm a (HH:mm)";

export function formatClockTime(value: Date | string): string {
  return format(
    typeof value === "string" ? new Date(value) : value,
    CLOCK_TIME_PATTERN,
  );
}
