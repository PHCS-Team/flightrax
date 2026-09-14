"use client";

import { FileSpreadsheetIcon } from "lucide-react";

import { ScheduleFormSheet } from "@/modules/schedule/components/schedule-form-sheet";
import { ScheduleUploadForm } from "@/modules/schedule/components/schedule-upload-form";

export function ScheduleUploadDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <ScheduleFormSheet
      description="Post the Excel schedule as it is. Set the dates it covers and it appears on those days of the calendar."
      icon={FileSpreadsheetIcon}
      onOpenChange={onOpenChange}
      open={open}
      title="Upload Schedule File"
    >
      {open && (
        <ScheduleUploadForm
          onCancel={() => onOpenChange(false)}
          onUploaded={() => onOpenChange(false)}
        />
      )}
    </ScheduleFormSheet>
  );
}
