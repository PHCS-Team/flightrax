"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  formatMonthLabel,
  operationsMonth,
  shiftMonth,
} from "@/modules/schedule/utils/schedule-month";
import { Button } from "@/shared/components/ui/button";

const NAV_BUTTON_CLASS =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground";

export function ScheduleMonthStrip({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  const current = operationsMonth();

  return (
    <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
      <div className="flex items-center gap-1">
        <button
          aria-label="Previous month"
          className={NAV_BUTTON_CLASS}
          onClick={() => onChange(shiftMonth(month, -1))}
          type="button"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <p className="min-w-36 text-center text-sm font-semibold text-primary-foreground">
          {formatMonthLabel(month)}
        </p>
        <button
          aria-label="Next month"
          className={NAV_BUTTON_CLASS}
          onClick={() => onChange(shiftMonth(month, 1))}
          type="button"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
      <Button
        className="h-7 px-2.5 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        disabled={month === current}
        onClick={() => onChange(current)}
        size="sm"
        type="button"
        variant="ghost"
      >
        This month
      </Button>
    </div>
  );
}
