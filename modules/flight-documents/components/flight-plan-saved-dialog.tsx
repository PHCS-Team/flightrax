"use client";

import { CircleCheckIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

export function FlightPlanSavedDialog({
  closeLabel = "Close and stay on the flight plan",
  description,
  isSubmittingForApproval = false,
  onBackToList,
  onClose,
  onProceedToWeightBalance,
  onSubmitForApproval,
  open,
  showProceed = true,
  submitForApprovalLabel = "Submit request for approval",
  title = "Flight Plan Saved",
}: {
  closeLabel?: string;
  description: string;
  isSubmittingForApproval?: boolean;
  onBackToList: () => void;
  onClose: () => void;
  onProceedToWeightBalance?: () => void;
  onSubmitForApproval?: () => void;
  open: boolean;
  showProceed?: boolean;
  submitForApprovalLabel?: string;
  title?: string;
}) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmittingForApproval) {
          onClose();
        }
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-md">
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
                : submitForApprovalLabel}
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
          {onSubmitForApproval && (
            <Button
              disabled={isSubmittingForApproval}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              {closeLabel}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
