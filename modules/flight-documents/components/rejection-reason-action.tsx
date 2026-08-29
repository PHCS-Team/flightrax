"use client";

import { MessageSquareWarningIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

export function RejectionReasonAction({
  className,
  reason,
}: {
  className?: string;
  reason: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingActionButton
        className={className}
        icon={MessageSquareWarningIcon}
        label="View Rejection Reason"
        onClick={() => setOpen(true)}
        variant="destructive"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-md">
          <DialogSectionHeader
            description="Fix the issues below, then save to resubmit your flight plan."
            icon={MessageSquareWarningIcon}
            title="Rejection Reason"
          />
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {reason}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
