import { format, parseISO } from "date-fns";

import type { InstructorUnavailability } from "@/modules/instructors/types/instructor";

// All availability dates are zulu calendar dates — "today" is the
// current UTC date.
export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export type InstructorAvailabilityStatus =
  | { kind: "available" }
  | { kind: "upcoming"; period: InstructorUnavailability }
  | { kind: "unavailable"; period: InstructorUnavailability };

// Expects current + upcoming periods sorted by start date (the shape the
// instructors service returns).
export function getInstructorAvailabilityStatus(
  unavailabilities: InstructorUnavailability[],
  today = todayUtcDate(),
): InstructorAvailabilityStatus {
  const current = unavailabilities.find(
    (period) => period.startsOn <= today && today <= period.endsOn,
  );

  if (current) {
    return { kind: "unavailable", period: current };
  }

  const upcoming = unavailabilities.find((period) => period.startsOn > today);

  if (upcoming) {
    return { kind: "upcoming", period: upcoming };
  }

  return { kind: "available" };
}

export function formatUnavailabilityDate(date: string): string {
  const parsed = parseISO(date);
  const sameYear = parsed.getUTCFullYear() === new Date().getUTCFullYear();

  return format(parsed, sameYear ? "MMM d" : "MMM d, yyyy");
}

export function formatUnavailabilityRange(
  period: InstructorUnavailability,
): string {
  if (period.startsOn === period.endsOn) {
    return formatUnavailabilityDate(period.startsOn);
  }

  return `${formatUnavailabilityDate(period.startsOn)} to ${formatUnavailabilityDate(period.endsOn)}`;
}

export function getAvailabilityStatusLabel(
  status: InstructorAvailabilityStatus,
): string {
  if (status.kind === "unavailable") {
    return `Unavailable till ${formatUnavailabilityDate(status.period.endsOn)}`;
  }

  if (status.kind === "upcoming") {
    return `Will not be available on ${formatUnavailabilityRange(status.period)}`;
  }

  return "Available";
}
