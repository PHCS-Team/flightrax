"use client";

import { DownloadIcon, FileTextIcon, ScaleIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

// Page-header action that opens the document download dialog: flight
// plan PDF, Weight & Balance PDF, or both. Reused wherever a flight's
// documents can be exported. Options without a handler render disabled
// — PDF generation arrives in a later phase.
export function DownloadFlightDocumentsAction({
  onDownloadBoth,
  onDownloadFlightPlan,
  onDownloadWeightBalance,
}: {
  onDownloadBoth?: () => void;
  onDownloadFlightPlan?: () => void;
  onDownloadWeightBalance?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasAnyAction = Boolean(
    onDownloadFlightPlan || onDownloadWeightBalance || onDownloadBoth,
  );

  return (
    <>
      <Button
        className="hidden h-10 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:inline-flex"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <DownloadIcon className="size-4" />
        Download
      </Button>

      <FloatingActionButton
        className="sm:hidden"
        icon={DownloadIcon}
        label="Download Documents"
        onClick={() => setOpen(true)}
      />

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="p-6 sm:max-w-md">
          <DialogSectionHeader
            description="Choose which documents to download in PDF format."
            icon={DownloadIcon}
            title="Download Documents"
          />

          <div className="grid gap-2">
            <Button
              className="justify-start disabled:cursor-default"
              disabled={!onDownloadFlightPlan}
              onClick={onDownloadFlightPlan}
              type="button"
              variant="outline"
            >
              <FileTextIcon className="size-4" />
              Flight plan (PDF)
            </Button>
            <Button
              className="justify-start disabled:cursor-default"
              disabled={!onDownloadWeightBalance}
              onClick={onDownloadWeightBalance}
              type="button"
              variant="outline"
            >
              <ScaleIcon className="size-4" />
              Weight & balance (PDF)
            </Button>
            <Button
              className="justify-start disabled:cursor-default"
              disabled={!onDownloadBoth}
              onClick={onDownloadBoth}
              type="button"
              variant="outline"
            >
              <DownloadIcon className="size-4" />
              Download both
            </Button>
          </div>

          {!hasAnyAction && (
            <p className="text-xs text-muted-foreground">
              PDF downloads are coming soon.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
