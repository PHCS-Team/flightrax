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
          ? `${aircraft.registrationMark} will be removed from the fleet, along with its image, weight and balance configuration, and schedule entries. Aircraft with filed flight plans cannot be deleted; set them to Retired instead.`
          : "Remove this aircraft from the fleet."
      }
      icon={Trash2Icon}
      isConfirming={deleteAircraft.isExecuting}
      onConfirm={() => {
        if (aircraft) {
          deleteAircraft.execute({
            aircraftId: aircraft.id,
            expectedUpdatedAt: aircraft.updatedAt,
          });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete Aircraft?"
    />
  );
}
