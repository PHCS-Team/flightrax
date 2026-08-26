"use client";

import { PencilIcon, PlusIcon } from "lucide-react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

// Mobile entry point for the header actions the table hides on small
// screens: add an aircraft or manage the aircraft types.
export function AircraftActionsDialog({
  onAddAircraft,
  onManageTypes,
  onOpenChange,
  open,
}: {
  onAddAircraft: () => void;
  onManageTypes: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] p-6 sm:w-full sm:max-w-sm">
        <DialogSectionHeader
          description="Choose what you want to do."
          icon={PlusIcon}
          title="Aircraft Actions"
        />
        <div className="grid gap-2">
          <Button onClick={onAddAircraft} type="button">
            <PlusIcon className="size-4" />
            Add aircraft
          </Button>
          <Button onClick={onManageTypes} type="button" variant="outline">
            <PencilIcon className="size-4" />
            Manage aircraft types
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
