"use client";

import { CalendarPlusIcon } from "lucide-react";

import { ScheduleEntryForm } from "@/modules/schedule/components/schedule-entry-form";
import { ScheduleFormSheet } from "@/modules/schedule/components/schedule-form-sheet";
import type {
  ScheduleAircraft,
  ScheduleEntry,
} from "@/modules/schedule/types/schedule";

export function ScheduleEntryDialog({
  aircraft,
  date,
  entry,
  onDelete,
  onOpenChange,
  open,
}: {
  aircraft: ScheduleAircraft | null;
  date: string;
  entry: ScheduleEntry | null;
  onDelete: (entry: ScheduleEntry) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <ScheduleFormSheet
      description={
        entry
          ? "Change the block. Students see the update right away."
          : "Put a block on this aircraft. Students file their flight requests from what is posted here."
      }
      icon={CalendarPlusIcon}
      onOpenChange={onOpenChange}
      open={open && aircraft !== null}
      title={entry ? "Edit Entry" : "Post Entry"}
    >
      {aircraft && (
        <ScheduleEntryForm
          aircraft={aircraft}
          date={date}
          entry={entry}
          key={entry?.id ?? aircraft.id}
          onCancel={() => onOpenChange(false)}
          onDelete={onDelete}
          onSaved={() => onOpenChange(false)}
        />
      )}
    </ScheduleFormSheet>
  );
}
