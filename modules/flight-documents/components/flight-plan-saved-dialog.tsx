"use client";

import { CircleCheckIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

// Post-save choice shown after creating or editing a flight plan. The
// Weight & Balance button unlocks once that phase ships.
export function FlightPlanSavedDialog({
  description,
  onBackToList,
  open,
}: {
  description: string;
  onBackToList: () => void;
  open: boolean;
}) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <CircleCheckIcon className="size-10 text-primary" />
          <p className="text-lg font-semibold text-foreground">
            Flight Plan Saved
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-2 grid gap-2">
          <Button disabled type="button">
            Proceed to Weight &amp; Balance
          </Button>
          <p className="-mt-1 text-center text-[10px] text-muted-foreground">
            Available once the Weight &amp; Balance phase ships.
          </p>
          <Button onClick={onBackToList} type="button" variant="outline">
            Go back to flight documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
