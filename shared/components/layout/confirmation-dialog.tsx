"use client";

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
  confirmingLabel?: string;
  description: string;
  icon: LucideIcon;
  isConfirming?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  typeToConfirm?: string;
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
  typeToConfirm,
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
            variant="destructive"
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
