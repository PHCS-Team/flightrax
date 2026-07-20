"use client";

import { StickyNoteIcon, WrenchIcon } from "lucide-react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";

export function AircraftRemarksDialog({
  aircraftIdentification,
  onOpenChange,
  open,
  remarks,
}: {
  aircraftIdentification: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  remarks: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogSectionHeader
          description={`Maintenance notes and remarks for ${aircraftIdentification}`}
          icon={WrenchIcon}
          title="Aircraft remarks"
        />
        {remarks ? (
          <div className="rounded-xl border bg-muted/40 p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <StickyNoteIcon className="size-3.5" />
              Note
            </div>
            <div className="border-l-2 border-primary/25 pl-3">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {remarks}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            No remarks recorded for this aircraft.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
