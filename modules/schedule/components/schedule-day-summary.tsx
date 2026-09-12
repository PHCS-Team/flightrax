"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { ScheduleDaySummary as ScheduleDaySummaryType } from "@/modules/schedule/types/schedule";
import {
  formatDateKey,
  shiftDateKey,
  todayDateKey,
} from "@/modules/schedule/utils/schedule-date";
import { Button } from "@/shared/components/ui/button";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

function StatCard({
  dot,
  label,
  value,
}: {
  dot: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/70">
        <span className={cn("size-2 rounded-full", dot)} />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-primary-foreground">{value}</p>
    </div>
  );
}

const NAV_BUTTON_CLASSES =
  "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

export function ScheduleDaySummary({
  date,
  onDateChange,
  summary,
}: {
  date: string;
  onDateChange: (date: string) => void;
  summary: ScheduleDaySummaryType;
}) {
  return (
    <GlassSurface className="space-y-3 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Previous day"
            className={NAV_BUTTON_CLASSES}
            onClick={() => onDateChange(shiftDateKey(date, -1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
          <p className="min-w-32 text-lg font-semibold text-primary-foreground">
            {formatDateKey(date)}
          </p>
          <Button
            aria-label="Next day"
            className={NAV_BUTTON_CLASSES}
            onClick={() => onDateChange(shiftDateKey(date, 1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            className="border-primary-foreground/20 bg-primary-foreground/10 text-sm text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => onDateChange(todayDateKey())}
            size="sm"
            type="button"
            variant="outline"
          >
            Today
          </Button>
          <Input
            className="h-9 w-40 cursor-pointer md:h-10"
            onChange={(event) => {
              if (event.target.value) {
                onDateChange(event.target.value);
              }
            }}
            type="date"
            value={date}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard dot="bg-emerald-300" label="Flights" value={summary.flights} />
        <StatCard
          dot="bg-amber-300"
          label="Pending Approval"
          value={summary.pendingFlights}
        />
        <StatCard
          dot="bg-rose-300"
          label="Instructors Unavailable"
          value={summary.unavailableInstructors}
        />
        <StatCard
          dot="bg-sky-300"
          label="Aircraft in Maintenance"
          value={summary.maintenanceAircraft}
        />
      </div>
    </GlassSurface>
  );
}