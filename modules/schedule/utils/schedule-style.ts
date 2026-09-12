import type {
  ScheduleCategory,
  ScheduleEntry,
  ScheduleStatus,
} from "@/modules/schedule/types/schedule";

// Visual metadata for statuses and categories. Styled to read on the
// dark glass surfaces used across the dashboard.
export const SCHEDULE_STATUS_META: Record<
  ScheduleStatus,
  { label: string; chip: string; dot: string }
> = {
  approved: {
    label: "Approved",
    chip: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    dot: "bg-emerald-300",
  },
  pending_approval: {
    label: "Pending Approval",
    chip: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    dot: "bg-amber-300",
  },
  unavailable: {
    label: "Unavailable",
    chip: "border-rose-300/30 bg-rose-300/10 text-rose-100",
    dot: "bg-rose-300",
  },
  maintenance: {
    label: "Maintenance",
    chip: "border-sky-300/30 bg-sky-300/10 text-sky-100",
    dot: "bg-sky-300",
  },
};

export const SCHEDULE_CATEGORY_META: Record<
  ScheduleCategory,
  { label: string; dot: string }
> = {
  flight: { label: "Flight Schedules", dot: "bg-emerald-300" },
  availability: { label: "Instructor Availability", dot: "bg-rose-300" },
  maintenance: { label: "Aircraft Maintenance", dot: "bg-sky-300" },
};

export const SCHEDULE_CATEGORY_ORDER: readonly ScheduleCategory[] = [
  "flight",
  "availability",
  "maintenance",
];

export function categoryLabel(category: ScheduleCategory): string {
  return SCHEDULE_CATEGORY_META[category].label;
}

export function statusLabel(status: ScheduleStatus): string {
  return SCHEDULE_STATUS_META[status].label;
}

// "HHMM" zulu → "08:30Z".
export function formatHhmmZ(raw: string): string {
  if (raw.length !== 4) {
    return raw;
  }

  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}Z`;
}

function categoryRank(category: ScheduleCategory): number {
  return SCHEDULE_CATEGORY_ORDER.indexOf(category);
}

// Deterministic order: category → start day → flight time → registry.
export function compareEntries(a: ScheduleEntry, b: ScheduleEntry): number {
  const categoryComparison = categoryRank(a.category) - categoryRank(b.category);

  if (categoryComparison !== 0) {
    return categoryComparison;
  }

  if (a.startsOn !== b.startsOn) {
    return a.startsOn < b.startsOn ? -1 : 1;
  }

  const aTime = a.startTimeUtc ?? "";
  const bTime = b.startTimeUtc ?? "";

  if (aTime !== bTime) {
    return aTime < bTime ? -1 : 1;
  }

  return a.registry.localeCompare(b.registry);
}