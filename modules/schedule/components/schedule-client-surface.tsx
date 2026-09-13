"use client";

import { CalendarClockIcon, PlaneIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { ScheduleDayStrip } from "@/modules/schedule/components/schedule-day-strip";
import { ScheduleEntryDeleteConfirmation } from "@/modules/schedule/components/schedule-entry-delete-confirmation";
import { ScheduleEntryDialog } from "@/modules/schedule/components/schedule-entry-dialog";
import { ScheduleLegendAction } from "@/modules/schedule/components/schedule-legend-action";
import { ScheduleTimeGrid } from "@/modules/schedule/components/schedule-time-grid";
import { useScheduleDay } from "@/modules/schedule/hooks/use-schedule-day.query";
import type {
  ScheduleAircraft,
  ScheduleEntry,
} from "@/modules/schedule/types/schedule";
import {
  isDateString,
  operationsToday,
} from "@/modules/schedule/utils/schedule-time";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function ScheduleClientSurface({ canManage }: { canManage: boolean }) {
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(operationsToday()),
  );
  const activeDate = isDateString(date) ? date : operationsToday();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryAircraft, setEntryAircraft] = useState<ScheduleAircraft | null>(
    null,
  );
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] =
    useState<ScheduleEntry | null>(null);
  const day = useScheduleDay(activeDate);

  if (!day.isPending && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }

  if (day.isPending && !hasLoadedOnce) {
    return <LoadingScreen />;
  }

  if (day.error) {
    return (
      <EmptyState
        description={day.error.message}
        icon={<CalendarClockIcon className="size-7" />}
        title="Schedule could not be loaded"
      />
    );
  }

  const fleet = day.data?.aircraft ?? [];

  function openCreate(aircraft: ScheduleAircraft) {
    setEntryAircraft(aircraft);
    setEditingEntry(null);
    setEntryDialogOpen(true);
  }

  function openEdit(entry: ScheduleEntry) {
    const aircraft = fleet.find((item) => item.id === entry.aircraftId);

    if (!aircraft) {
      return;
    }

    setEntryAircraft(aircraft);
    setEditingEntry(entry);
    setEntryDialogOpen(true);
  }

  return (
    <TooltipProvider>
      <div className="sm:space-y-4">
        <div className="flex flex-col gap-3 px-2.5 pt-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:py-0">
          <ScheduleDayStrip date={activeDate} onChange={setDate} />
          <ScheduleLegendAction className="hidden sm:flex" />
        </div>

        {day.isPending || !day.data ? (
          <LoadingScreen variant="section" />
        ) : fleet.length === 0 ? (
          <EmptyState
            description={
              canManage
                ? "Add aircraft to the fleet and they will appear here as rows."
                : "No aircraft are in the fleet yet. Check back later."
            }
            icon={<PlaneIcon className="size-7" />}
            title="No Aircraft In The Fleet"
          />
        ) : (
          <ScheduleTimeGrid
            canManage={canManage}
            day={day.data}
            isRefreshing={day.isPlaceholderData}
            onAddEntry={openCreate}
            onSelectEntry={openEdit}
          />
        )}
      </div>

      {canManage && (
        <>
          <ScheduleEntryDialog
            aircraft={entryAircraft}
            date={activeDate}
            entry={editingEntry}
            onDelete={(entry) => {
              setEntryDialogOpen(false);
              setEntryPendingDelete(entry);
            }}
            onOpenChange={setEntryDialogOpen}
            open={entryDialogOpen}
          />
          <ScheduleEntryDeleteConfirmation
            entry={entryPendingDelete}
            onOpenChange={(open) => {
              if (!open) setEntryPendingDelete(null);
            }}
            open={Boolean(entryPendingDelete)}
          />
        </>
      )}
    </TooltipProvider>
  );
}
