"use client";

import { useEffect, useRef } from "react";

import { ScheduleEntryBlock } from "@/modules/schedule/components/schedule-entry-block";
import {
  SCHEDULE_FIRST_VISIBLE_HOUR,
  SCHEDULE_HOURS,
} from "@/modules/schedule/constants/schedule-options";
import type {
  ScheduleAircraft,
  ScheduleDay,
  ScheduleEntry,
} from "@/modules/schedule/types/schedule";
import { groupAircraftByType } from "@/modules/schedule/utils/schedule-groups";
import { formatHourColumn } from "@/modules/schedule/utils/schedule-time";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

const SIZE_VARS =
  "[--hour-w:64px] [--reg-w:96px] [--row-h:56px] [--type-w:0px] sm:[--hour-w:88px] sm:[--reg-w:128px] sm:[--row-h:72px] sm:[--type-w:72px]";
const ROW_BORDER = "border-b border-primary-foreground/10";
const STICKY_CELL = "sticky z-10 shrink-0 bg-primary";
const REGISTRY_CELL =
  "left-(--type-w) flex min-h-(--row-h) w-(--reg-w) flex-col justify-center gap-0.5 px-2 py-1 text-xs leading-tight sm:text-sm";
const HOUR_LINES =
  "bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--hour-w)/2-1px),rgba(255,255,255,0.08)_calc(var(--hour-w)/2-1px),rgba(255,255,255,0.08)_calc(var(--hour-w)/2),transparent_calc(var(--hour-w)/2),transparent_calc(var(--hour-w)-1px),rgba(255,255,255,0.2)_calc(var(--hour-w)-1px),rgba(255,255,255,0.2)_var(--hour-w))]";

export function ScheduleTimeGrid({
  canManage,
  day,
  isRefreshing,
  onAddEntry,
  onSelectEntry,
}: {
  canManage: boolean;
  day: ScheduleDay;
  isRefreshing: boolean;
  onAddEntry: (aircraft: ScheduleAircraft) => void;
  onSelectEntry: (entry: ScheduleEntry) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const hourWidth = parseFloat(
      getComputedStyle(element).getPropertyValue("--hour-w"),
    );

    element.scrollTo({ left: SCHEDULE_FIRST_VISIBLE_HOUR * hourWidth });
  }, []);

  const groups = groupAircraftByType(day.aircraft);
  const entriesByAircraft = new Map<string, ScheduleEntry[]>();

  for (const entry of day.entries) {
    const list = entriesByAircraft.get(entry.aircraftId) ?? [];
    list.push(entry);
    entriesByAircraft.set(entry.aircraftId, list);
  }

  return (
    <GlassSurface
      className={cn(
        "overflow-hidden transition-opacity",
        isRefreshing && "opacity-70",
      )}
    >
      <div
        className={cn(
          "scrollbar-none overflow-x-auto overscroll-x-contain",
          SIZE_VARS,
        )}
        ref={scrollRef}
      >
        <div className="min-w-full w-[calc(var(--type-w)+var(--reg-w)+24*var(--hour-w))]">
          <div className="flex text-[10px] font-semibold uppercase tracking-wide text-primary-foreground/70 sm:text-[11px]">
            <div
              className={cn(
                STICKY_CELL,
                "left-0 z-20 hidden w-(--type-w) border-r border-b border-primary-foreground/15 border-b-primary-foreground/20 px-3 py-2 sm:block sm:py-2.5",
              )}
            >
              Type
            </div>
            <div
              className={cn(
                STICKY_CELL,
                "left-(--type-w) z-20 w-(--reg-w) border-b border-primary-foreground/20 px-2 py-2 sm:py-2.5",
              )}
            >
              Registry
            </div>
            {SCHEDULE_HOURS.map((hour) => (
              <div
                className="w-(--hour-w) shrink-0 border-b border-l border-primary-foreground/15 px-1.5 py-2 whitespace-nowrap sm:px-2 sm:py-2.5"
                key={hour}
              >
                {formatHourColumn(hour)}
              </div>
            ))}
          </div>

          {groups.map((group, groupIndex) => {
            const isLastGroup = groupIndex === groups.length - 1;

            return (
              <div key={`${group.label}-${groupIndex}`}>
                <div className="flex sm:hidden">
                  <div className="sticky left-0 z-10 w-(--reg-w) shrink-0 bg-sky-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                    {group.label}
                  </div>
                  <div className="flex-1 bg-sky-200" />
                </div>

                <div className="flex">
                  <div
                    className={cn(
                      STICKY_CELL,
                      "left-0 hidden w-(--type-w) items-center justify-center border-r border-primary-foreground/15 px-2 text-center text-sm font-semibold uppercase text-primary-foreground/80 sm:flex",
                      !isLastGroup && ROW_BORDER,
                    )}
                  >
                    <span className="wrap-break-word">{group.label}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {group.aircraft.map((aircraft, index) => {
                      const isLastRow =
                        isLastGroup && index === group.aircraft.length - 1;

                      return (
                        <div className="flex" key={aircraft.id}>
                          {canManage ? (
                            <button
                              className={cn(
                                STICKY_CELL,
                                REGISTRY_CELL,
                                "cursor-pointer text-left transition hover:bg-[color-mix(in_oklch,var(--primary),white_10%)]",
                                !isLastRow && ROW_BORDER,
                              )}
                              onClick={() => onAddEntry(aircraft)}
                              type="button"
                            >
                              <span className="font-bold wrap-break-word text-primary-foreground">
                                {aircraft.registrationMark}
                              </span>
                              <span className="text-[9px] font-medium text-primary-foreground/55 sm:text-[10px]">
                                <span className="sm:hidden">Tap to add</span>
                                <span className="hidden sm:inline">
                                  Click to add
                                </span>
                              </span>
                            </button>
                          ) : (
                            <div
                              className={cn(
                                STICKY_CELL,
                                REGISTRY_CELL,
                                !isLastRow && ROW_BORDER,
                              )}
                            >
                              <span className="font-bold wrap-break-word text-primary-foreground">
                                {aircraft.registrationMark}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "relative min-h-(--row-h) w-[calc(24*var(--hour-w))] shrink-0",
                              HOUR_LINES,
                              !isLastRow && ROW_BORDER,
                            )}
                          >
                            {(entriesByAircraft.get(aircraft.id) ?? []).map(
                              (entry) => (
                                <ScheduleEntryBlock
                                  canManage={canManage}
                                  date={day.date}
                                  entry={entry}
                                  key={entry.id}
                                  onSelect={onSelectEntry}
                                />
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassSurface>
  );
}
