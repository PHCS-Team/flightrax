"use client";

import { parseAsString, useQueryState } from "nuqs";

import { ScheduleTimeGrid } from "@/modules/schedule/components/schedule-time-grid";
import { ScheduleWeekStrip } from "@/modules/schedule/components/schedule-week-strip";
import { useScheduleForDate } from "@/modules/schedule/hooks/use-schedule.query";
import { todayDateKey } from "@/modules/schedule/utils/schedule-date";
import { CalendarRangeIcon } from "lucide-react";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

export function ScheduleClientSurface() {
  const [dateRaw, setDateRaw] = useQueryState(
    "date",
    parseAsString.withDefault(todayDateKey()),
  );

  const date = dateRaw;
  const month = date.slice(0, 7);

  const table = useScheduleForDate(month, date);

  if (table.isPending) {
    return <LoadingScreen />;
  }

  if (table.error) {
    return (
      <EmptyState
        description={table.error?.message ?? "Something went wrong."}
        icon={<CalendarRangeIcon className="size-7" />}
        title="Schedule could not be loaded"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <ScheduleWeekStrip
        date={date}
        onDateChange={setDateRaw}
      />
      <ScheduleTimeGrid
        entries={table.entries}
        emptyMessage="No schedules for this period."
      />
    </div>
  );
}