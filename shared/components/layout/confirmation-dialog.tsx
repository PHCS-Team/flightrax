"use client";

import { TriangleAlertIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

type ConfirmationDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  confirmingLabel?: string;
  description: string;
  icon: LucideIcon;
  isConfirming?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  typeToConfirm?: string;
  warning?: string;
};

export function ConfirmationDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "destructive",
  confirmingLabel = confirmLabel,
  description,
  icon,
  isConfirming = false,
  onConfirm,
  onOpenChange,
  open,
  title,
  typeToConfirm,
  warning,
}: ConfirmationDialogProps) {
  const [challengeValue, setChallengeValue] = useState("");
  const isChallengePassed = !typeToConfirm || challengeValue === typeToConfirm;

  function handleOpenChange(nextOpen: boolean) {
    setChallengeValue("");
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogSectionHeader
          description={description}
          icon={icon}
          title={title}
        />
        {warning && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2.5">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-sm font-medium leading-relaxed text-amber-800">
              {warning}
            </p>
          </div>
        )}
        {typeToConfirm && (
          <div className="grid gap-2">
            <p className="text-xs text-muted-foreground">
              To confirm, type{" "}
              <span className="font-semibold text-foreground">
                {typeToConfirm}
              </span>{" "}
              below.
            </p>
            <Input
              aria-label={`Type ${typeToConfirm} to confirm`}
              autoComplete="off"
              className="border-border bg-muted/30 uppercase text-[#121212] placeholder:normal-case placeholder:text-muted-foreground/55"
              disabled={isConfirming}
              onChange={(event) =>
                setChallengeValue(event.target.value.toUpperCase())
              }
              placeholder={`Type ${typeToConfirm}`}
              value={challengeValue}
            />
          </div>
        )}
        <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
          <Button
            disabled={isConfirming}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            className="disabled:cursor-default"
            disabled={isConfirming || !isChallengePassed}
            onClick={onConfirm}
            type="button"
            variant={confirmVariant}
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
