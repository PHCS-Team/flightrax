"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteScheduleUpload } from "@/modules/schedule/hooks/use-delete-schedule-upload.action";
import type { ScheduleUpload } from "@/modules/schedule/types/schedule-upload";
import { uploadDisplayName } from "@/modules/schedule/utils/schedule-upload-format";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";

export function ScheduleUploadDeleteConfirmation({
  onOpenChange,
  open,
  upload,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  upload: ScheduleUpload | null;
}) {
  const deleteUpload = useDeleteScheduleUpload({
    onDeleted: () => onOpenChange(false),
  });

  return (
    <ConfirmationDialog
      confirmLabel="Remove file"
      confirmingLabel="Removing..."
      description={
        upload
          ? `"${uploadDisplayName(upload)}" disappears from the calendar and the file is deleted. Upload it again if it still applies.`
          : ""
      }
      icon={Trash2Icon}
      isConfirming={deleteUpload.isExecuting}
      onConfirm={() => {
        if (upload) {
          deleteUpload.execute({ id: upload.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Remove Schedule File?"
    />
  );
}
