"use client";

import { SCHEDULE_SESSION_TYPE_META } from "@/modules/schedule/constants/session-types";
import type { ScheduleEntry } from "@/modules/schedule/types/schedule";
import {
  formatClockRange,
  MINUTES_PER_DAY,
  minutesIntoDay,
} from "@/modules/schedule/utils/schedule-time";
import { cn } from "@/shared/lib/utils";

export function ScheduleEntryBlock({
  canManage,
  date,
  entry,
  onSelect,
}: {
  canManage: boolean;
  date: string;
  entry: ScheduleEntry;
  onSelect: (entry: ScheduleEntry) => void;
}) {
  const meta = SCHEDULE_SESSION_TYPE_META[entry.sessionType];
  const start = Math.max(0, minutesIntoDay(entry.startsAt, date));
  const end = Math.min(MINUTES_PER_DAY, minutesIntoDay(entry.endsAt, date));
  const clockRange = formatClockRange(entry.startsAt, entry.endsAt, date);
  const title = [
    `${meta.label} ${clockRange}`,
    entry.pilot?.fullName,
    entry.instructor?.fullName,
    entry.label,
  ]
    .filter(Boolean)
    .join(" · ");
  const style = {
    left: `${(start / MINUTES_PER_DAY) * 100}%`,
    width: `${((end - start) / MINUTES_PER_DAY) * 100}%`,
  };
  const className = cn(
    "absolute inset-y-0.5 flex flex-col overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] leading-tight shadow-sm ring-1 ring-white/15 sm:inset-y-1 sm:px-1.5 sm:py-1 sm:text-[11px]",
    meta.className,
  );
  const content = (
    <>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold">{meta.code}</span>
        <span className="text-[9px] tabular-nums opacity-80 sm:text-[10px]">
          {clockRange}
        </span>
      </span>
      {entry.pilot && (
        <span className="truncate font-medium">{entry.pilot.fullName}</span>
      )}
      {entry.instructor && (
        <span className="truncate">{entry.instructor.fullName}</span>
      )}
      {entry.label && <span className="truncate italic">{entry.label}</span>}
    </>
  );

  if (!canManage) {
    return (
      <div className={className} style={style} title={title}>
        {content}
      </div>
    );
  }

  return (
    <button
      className={cn(
        className,
        "cursor-pointer transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
      onClick={() => onSelect(entry)}
      style={style}
      title={title}
      type="button"
    >
      {content}
    </button>
  );
}
