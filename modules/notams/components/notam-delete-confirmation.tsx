"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteNotam } from "@/modules/notams/hooks/use-delete-notam.action";
import type { Notam } from "@/modules/notams/types/notam";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";

export function NotamDeleteConfirmation({
  notam,
  onOpenChange,
  open,
}: {
  notam: Notam | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const deleteNotam = useDeleteNotam({
    onDeleted: () => onOpenChange(false),
  });

  return (
    <ConfirmationDialog
      confirmLabel="Delete NOTAM"
      confirmingLabel="Deleting..."
      description="This notice will disappear from every pilot's dashboard immediately. Post a new one if it still applies."
      icon={Trash2Icon}
      isConfirming={deleteNotam.isExecuting}
      onConfirm={() => {
        if (notam) {
          deleteNotam.execute({ id: notam.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete NOTAM?"
    />
  );
}