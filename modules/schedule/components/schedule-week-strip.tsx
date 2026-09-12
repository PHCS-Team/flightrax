"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  formatDayNumber,
  getWeekDays,
  isTodayDateKey,
  shiftDateKey,
  todayDateKey,
  WEEKDAY_LABELS,
} from "@/modules/schedule/utils/schedule-date";

export function ScheduleWeekStrip({
  date,
  onDateChange,
}: {
  date: string;
  onDateChange: (date: string) => void;
}) {
  const weekDays = getWeekDays(date);
  const today = todayDateKey();

  return (
    <GlassSurface className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5">
        <Button
          aria-label="Previous week"
          className="shrink-0"
          onClick={() => onDateChange(shiftDateKey(date, -7))}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <div className="grid flex-1 grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const selected = day === date;
            const isToday = isTodayDateKey(day);

            return (
              <button
                aria-label={day}
                aria-pressed={selected}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 transition-colors",
                  selected
                    ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                    : "border-primary-foreground/15 text-primary-foreground/70 hover:border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
                key={day}
                onClick={() => onDateChange(day)}
                type="button"
              >
                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-primary-foreground/60">
                  {WEEKDAY_LABELS[
                    new Date(`${day}T00:00:00Z`).getUTCDay()
                  ]}
                </span>
                <span className="text-sm font-semibold">
                  {formatDayNumber(day)}
                </span>
                {isToday && (
                  <span className="size-1 rounded-full bg-emerald-300" />
                )}
              </button>
            );
          })}
        </div>

        <Button
          aria-label="Next week"
          className="shrink-0"
          onClick={() => onDateChange(shiftDateKey(date, 7))}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronRightIcon className="size-4" />
        </Button>

        <Button
          className="hidden shrink-0 sm:inline-flex"
          disabled={date === today}
          onClick={() => onDateChange(today)}
          size="sm"
          type="button"
          variant="outline"
        >
          Today
        </Button>
      </div>
    </GlassSurface>
  );
}
