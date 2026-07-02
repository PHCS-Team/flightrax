"use client";

import type { LucideIcon } from "lucide-react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";

type ConfirmationDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  confirmingLabel?: string;
  description: string;
  icon: LucideIcon;
  isConfirming?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function ConfirmationDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  confirmingLabel = confirmLabel,
  description,
  icon,
  isConfirming = false,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogSectionHeader
          description={description}
          icon={icon}
          title={title}
        />
        <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
          <Button
            className="cursor-pointer rounded-lg disabled:cursor-default sm:rounded-2xl"
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            className="cursor-pointer rounded-lg disabled:cursor-default sm:rounded-2xl"
            disabled={isConfirming}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
