"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/shared/components/ui/button";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import type { ScheduleEntry } from "@/modules/schedule/types/schedule";
import { SCHEDULE_STATUS_META } from "@/modules/schedule/utils/schedule-style";
import {
  WEEKDAY_LABELS,
  currentMonthKey,
  expandDateRange,
  formatDayNumber,
  getCalendarDays,
  isDayInMonth,
  isTodayDateKey,
  monthLabel,
  shiftMonth,
} from "@/modules/schedule/utils/schedule-date";
import { cn } from "@/shared/lib/utils";

const MAX_VISIBLE_CHIPS = 3;

export function ScheduleCalendar({
  entries,
  month,
  onMonthChange,
  onSelectDay,
}: {
  entries: ScheduleEntry[];
  month: string;
  onMonthChange: (month: string) => void;
  onSelectDay: (date: string) => void;
}) {
  const days = useMemo(() => getCalendarDays(month), [month]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();

    for (const entry of entries) {
      for (const day of expandDateRange(entry.startsOn, entry.endsOn)) {
        const list = map.get(day) ?? [];
        list.push(entry);
        map.set(day, list);
      }
    }

    return map;
  }, [entries]);

  return (
    <GlassSurface className="p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-primary-foreground">
          {monthLabel(month)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Previous month"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            className="border-primary-foreground/20 bg-primary-foreground/10 text-sm text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => onMonthChange(currentMonthKey())}
            size="sm"
            type="button"
            variant="outline"
          >
            Today
          </Button>
          <Button
            aria-label="Next month"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="mt-3 hidden grid-cols-7 gap-1 sm:grid">
        {WEEKDAY_LABELS.map((label) => (
          <p
            className="py-1 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55"
            key={label}
          >
            {label}
          </p>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isDayInMonth(day, month);
          const isToday = isTodayDateKey(day);
          const dayEntries = entriesByDay.get(day) ?? [];
          const visible = dayEntries.slice(0, MAX_VISIBLE_CHIPS);
          const extra = dayEntries.length - visible.length;

          return (
            <button
              aria-label={`View schedule for ${day}`}
              className={cn(
                "flex min-h-16 cursor-pointer flex-col rounded-lg border p-1 text-left transition sm:min-h-20 sm:rounded-2xl",
                inMonth
                  ? "border-primary-foreground/15 bg-primary-foreground/5 hover:bg-primary-foreground/10"
                  : "border-transparent bg-transparent opacity-40 hover:bg-primary-foreground/5",
                isToday &&
                  "border-primary-foreground/45 ring-2 ring-primary-foreground/25",
              )}
              key={day}
              onClick={() => onSelectDay(day)}
              type="button"
            >
              <span
                className={cn(
                  "flex h-6 items-center px-1 text-xs font-semibold",
                  inMonth
                    ? "text-primary-foreground"
                    : "text-primary-foreground/40",
                )}
              >
                {formatDayNumber(day)}
              </span>
              <span className="mt-0.5 flex flex-col gap-0.5 px-0.5">
                {visible.map((entry) => (
                  <span
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[0.6rem] font-medium leading-3",
                      SCHEDULE_STATUS_META[entry.status].chip,
                    )}
                    key={entry.key}
                    title={`${entry.registry} — ${entry.legend}`}
                  >
                    {entry.registry}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="px-1 text-[0.62rem] text-primary-foreground/60">
                    +{extra} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </GlassSurface>
  );
}