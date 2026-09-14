"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import type { ScheduleUpload } from "@/modules/schedule/types/schedule-upload";
import { monthCalendarDates } from "@/modules/schedule/utils/schedule-month";
import { formatDateLabel, operationsToday } from "@/modules/schedule/utils/schedule-time";
import {
  uploadChipClass,
  uploadDisplayName,
} from "@/modules/schedule/utils/schedule-upload-format";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type WeekBar = {
  upload: ScheduleUpload;
  startCol: number;
  endCol: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

function weekBars(week: string[], uploads: ScheduleUpload[]): WeekBar[] {
  const weekStart = week[0];
  const weekEnd = week[week.length - 1];
  const laneEnds: string[] = [];

  return uploads
    .filter((upload) => upload.startsOn <= weekEnd && upload.endsOn >= weekStart)
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn))
    .map((upload) => {
      const from = upload.startsOn < weekStart ? weekStart : upload.startsOn;
      const to = upload.endsOn > weekEnd ? weekEnd : upload.endsOn;
      let lane = laneEnds.findIndex((end) => end < from);

      if (lane === -1) {
        lane = laneEnds.length;
      }

      laneEnds[lane] = to;

      return {
        upload,
        startCol: week.indexOf(from) + 1,
        endCol: week.indexOf(to) + 1,
        lane,
        continuesBefore: upload.startsOn < weekStart,
        continuesAfter: upload.endsOn > weekEnd,
      };
    });
}

export function ScheduleMonthCalendar({
  isRefreshing,
  month,
  uploads,
}: {
  isRefreshing: boolean;
  month: string;
  uploads: ScheduleUpload[];
}) {
  const today = operationsToday();
  const dates = monthCalendarDates(month);
  const weeks = Array.from({ length: dates.length / 7 }, (_, index) =>
    dates.slice(index * 7, index * 7 + 7),
  );
  const chipIndex = new Map(uploads.map((upload, index) => [upload.id, index]));

  return (
    <GlassSurface
      className={cn(
        "overflow-hidden transition-opacity",
        isRefreshing && "opacity-70",
      )}
    >
      <div className="grid grid-cols-7 border-b border-primary-foreground/20 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground/70 sm:text-[11px]">
        {WEEKDAYS.map((weekday) => (
          <div
            className="border-l border-primary-foreground/15 px-1.5 py-2 text-center first:border-l-0 sm:px-2 sm:py-2.5"
            key={weekday}
          >
            {weekday}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => {
        const bars = weekBars(week, uploads);
        const laneCount = bars.reduce((max, bar) => Math.max(max, bar.lane + 1), 0);
        const weekStyle: CSSProperties = {
          gridTemplateRows: `auto repeat(${Math.max(laneCount, 1)}, auto) minmax(0.5rem, 1fr)`,
        };

        return (
          <div
            className={cn(
              "grid min-h-20 grid-cols-7 border-b border-primary-foreground/10 sm:min-h-28",
              weekIndex === weeks.length - 1 && "border-b-0",
            )}
            key={week[0]}
            style={weekStyle}
          >
            {week.map((date, dayIndex) => {
              const inMonth = date.startsWith(month);

              return (
                <div
                  className={cn(
                    "border-l border-primary-foreground/10",
                    dayIndex === 0 && "border-l-0",
                    !inMonth && "bg-primary/40",
                  )}
                  key={date}
                  style={{ gridColumn: dayIndex + 1, gridRow: "1 / -1" }}
                />
              );
            })}

            {week.map((date, dayIndex) => {
              const inMonth = date.startsWith(month);
              const isToday = date === today;

              return (
                <div
                  className={cn(
                    "z-10 flex justify-end p-1 sm:justify-start sm:p-2",
                    !inMonth && "text-primary-foreground/40",
                  )}
                  key={`${date}-number`}
                  style={{ gridColumn: dayIndex + 1, gridRow: 1 }}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold sm:text-sm",
                      isToday && "bg-emerald-300 text-primary",
                    )}
                  >
                    {formatDateLabel(date, "d")}
                  </span>
                </div>
              );
            })}

            {bars.map((bar) => (
              <Link
                className={cn(
                  "z-10 mb-1 block min-w-0 truncate px-1.5 py-0.5 text-[10px] font-semibold leading-4 shadow-sm transition hover:opacity-85 sm:text-xs sm:leading-5",
                  uploadChipClass(chipIndex.get(bar.upload.id) ?? 0),
                  bar.continuesBefore ? "ml-0" : "ml-1 rounded-l-md sm:ml-2",
                  bar.continuesAfter ? "mr-0" : "mr-1 rounded-r-md sm:mr-2",
                )}
                href={`/schedule/uploads/${bar.upload.id}?date=${week[bar.startCol - 1]}`}
                key={bar.upload.id}
                style={{
                  gridColumn: `${bar.startCol} / ${bar.endCol + 1}`,
                  gridRow: bar.lane + 2,
                }}
                title={uploadDisplayName(bar.upload)}
              >
                {uploadDisplayName(bar.upload)}
              </Link>
            ))}
          </div>
        );
      })}
    </GlassSurface>
  );
}
