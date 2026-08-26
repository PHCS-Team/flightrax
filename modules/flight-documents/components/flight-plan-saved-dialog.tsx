"use client";

import { CircleCheckIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

export function FlightPlanSavedDialog({
  description,
  isSubmittingForApproval = false,
  onBackToList,
  onProceedToWeightBalance,
  onSubmitForApproval,
  open,
  showProceed = true,
  title = "Flight Plan Saved",
}: {
  description: string;
  isSubmittingForApproval?: boolean;
  onBackToList: () => void;
  onProceedToWeightBalance?: () => void;
  onSubmitForApproval?: () => void;
  open: boolean;
  showProceed?: boolean;
  title?: string;
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
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-2 grid gap-2">
          {onSubmitForApproval && (
            <Button
              disabled={isSubmittingForApproval}
              onClick={onSubmitForApproval}
              type="button"
            >
              {isSubmittingForApproval
                ? "Submitting..."
                : "Submit request for approval"}
            </Button>
          )}
          {showProceed && (
            <Button
              disabled={!onProceedToWeightBalance || isSubmittingForApproval}
              onClick={onProceedToWeightBalance}
              type="button"
            >
              Proceed to Weight &amp; Balance
            </Button>
          )}
          <Button
            disabled={isSubmittingForApproval}
            onClick={onBackToList}
            type="button"
            variant="outline"
          >
            Go back to flight documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
