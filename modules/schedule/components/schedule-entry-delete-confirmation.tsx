"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteScheduleEntry } from "@/modules/schedule/hooks/use-delete-schedule-entry.action";
import type { ScheduleEntry } from "@/modules/schedule/types/schedule";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";

export function ScheduleEntryDeleteConfirmation({
  entry,
  onOpenChange,
  open,
}: {
  entry: ScheduleEntry | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const deleteEntry = useDeleteScheduleEntry({
    onDeleted: () => onOpenChange(false),
  });

  return (
    <ConfirmationDialog
      confirmLabel="Delete entry"
      confirmingLabel="Deleting..."
      description="This block disappears from the board immediately. Post a new one if it still applies."
      icon={Trash2Icon}
      isConfirming={deleteEntry.isExecuting}
      onConfirm={() => {
        if (entry) {
          deleteEntry.execute({ id: entry.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete Entry?"
    />
  );
}
