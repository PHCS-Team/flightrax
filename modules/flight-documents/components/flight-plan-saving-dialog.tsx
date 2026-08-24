"use client";

import { Loader2Icon } from "lucide-react";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

// Blocking modal shown while a flight plan is being saved — no close
// button, and outside clicks / escape are disabled on purpose.
export function FlightPlanSavingDialog({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xs"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">
            Saving your flight plan...
          </p>
          <p className="text-xs text-muted-foreground">
            Please wait — do not close or leave this page.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
