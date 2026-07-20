"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteAircraft } from "@/modules/aircrafts/hooks/use-delete-aircraft.action";
import type { Aircraft } from "@/modules/aircrafts/types/aircraft";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";

export function AircraftDeleteConfirmation({
  aircraft,
  onOpenChange,
  open,
}: {
  aircraft: Aircraft | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const deleteAircraft = useDeleteAircraft({
    onDeleted: () => onOpenChange(false),
  });

  return (
    <ConfirmationDialog
      confirmLabel="Delete aircraft"
      confirmingLabel="Deleting..."
      description={
        aircraft
          ? `${aircraft.aircraftIdentification} will be removed from the fleet. Its image, weight and balance configuration, and any flight records will also be deleted.`
          : "Remove this aircraft from the fleet."
      }
      icon={Trash2Icon}
      isConfirming={deleteAircraft.isExecuting}
      onConfirm={() => {
        if (aircraft) {
          deleteAircraft.execute({ aircraftId: aircraft.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete aircraft?"
    />
  );
}
