"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  formatDateLabel,
  operationsToday,
  shiftDate,
  weekOf,
} from "@/modules/schedule/utils/schedule-time";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const NAV_BUTTON_CLASS =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground";

export function ScheduleDayStrip({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const today = operationsToday();
  const week = weekOf(date);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous week"
            className={NAV_BUTTON_CLASS}
            onClick={() => onChange(shiftDate(date, -7))}
            type="button"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <p className="min-w-32 text-center text-sm font-semibold text-primary-foreground">
            {formatDateLabel(date, "MMMM yyyy")}
          </p>
          <button
            aria-label="Next week"
            className={NAV_BUTTON_CLASS}
            onClick={() => onChange(shiftDate(date, 7))}
            type="button"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
        <Button
          className="h-7 px-2.5 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          disabled={date === today}
          onClick={() => onChange(today)}
          size="sm"
          type="button"
          variant="ghost"
        >
          Today
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {week.map((day) => {
          const selected = day === date;
          const isToday = day === today;

          return (
            <button
              aria-current={selected ? "date" : undefined}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border py-1.5 transition",
                selected
                  ? "border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground"
                  : "border-primary-foreground/15 bg-primary-foreground/5 text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
              key={day}
              onClick={() => onChange(day)}
              type="button"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {formatDateLabel(day, "EEE")}
              </span>
              <span className="text-sm font-bold sm:text-base">
                {formatDateLabel(day, "d")}
              </span>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isToday ? "bg-emerald-300" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
