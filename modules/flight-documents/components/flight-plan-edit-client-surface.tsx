"use client";

import {
  FileTextIcon,
  MessageSquareWarningIcon,
  ScaleIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanForm } from "@/modules/flight-documents/components/flight-plan-form";
import { FlightPlanHelp } from "@/modules/flight-documents/components/flight-plan-help-dialog";
import { FlightPlanSavedDialog } from "@/modules/flight-documents/components/flight-plan-saved-dialog";
import { FlightPlanSavingDialog } from "@/modules/flight-documents/components/flight-plan-saving-dialog";
import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { useDeleteFlightPlan } from "@/modules/flight-documents/hooks/use-delete-flight-plan.action";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useUpdateFlightPlan } from "@/modules/flight-documents/hooks/use-update-flight-plan.action";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function FlightPlanEditClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { flightPlan, error, isPending } =
    useOwnFlightPlanForEdit(flightPlanId);
  const updateFlightPlan = useUpdateFlightPlan({
    onSaved: () => setSavedDialogOpen(true),
  });
  const deleteFlightPlan = useDeleteFlightPlan({
    onDeleted: () => router.push("/flight-documents"),
  });

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<FileTextIcon className="size-7" />}
        title="Flight plan could not be loaded"
      />
    );
  }

  if (!flightPlan) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/flight-documents")}
            type="button"
          >
            Back to flight documents
          </Button>
        }
        description="This flight plan does not exist or does not belong to you."
        icon={<FileTextIcon className="size-7" />}
        title="Flight Plan Not Found"
      />
    );
  }

  const isEditable = EDITABLE_FLIGHT_REQUEST_STATUSES.some(
    (status) => status === flightPlan.requestStatus,
  );

  if (!isEditable) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/flight-documents")}
            type="button"
          >
            Back to flight documents
          </Button>
        }
        description="Only draft or rejected flight plans can be edited."
        icon={<FileTextIcon className="size-7" />}
        title="Flight Plan Locked"
      />
    );
  }

  const isRejected =
    flightPlan.requestStatus === "rejected" && flightPlan.rejectedReason;

  return (
    <TooltipProvider>
      <div className="sm:space-y-4">
        <AircraftHeaderCard aircraft={flightPlan.aircraft} />

        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:p-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
              disabled
              type="button"
              variant="outline"
            >
              <ScaleIcon className="size-4" />
              Go to Weight &amp; Balance
            </Button>
            <p className="text-[10px] text-primary-foreground/50 sm:hidden">
              Available once the Weight &amp; Balance phase ships.
            </p>
          </div>
          <Button
            className="border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50 disabled:cursor-default"
            disabled={deleteFlightPlan.isExecuting}
            onClick={() => setDeleteConfirmOpen(true)}
            type="button"
            variant="outline"
          >
            <Trash2Icon className="size-4" />
            Delete flight plan
          </Button>
        </div>

        <GlassSurface className="p-4 sm:p-6">
          <FlightPlanForm
            defaultValues={flightPlan.values}
            isSubmitting={updateFlightPlan.isExecuting}
            onCancel={() => router.push("/flight-documents")}
            onSubmit={(values) =>
              updateFlightPlan.execute({ ...values, flightPlanId })
            }
            submitLabel="Save changes"
          />
        </GlassSurface>

        <FlightPlanHelp />

        {isRejected && (
          <RejectionReasonAction reason={flightPlan.rejectedReason ?? ""} />
        )}

        <FlightPlanSavingDialog open={updateFlightPlan.isExecuting} />

        <FlightPlanSavedDialog
          description="Your changes are saved. You can fill up the Weight & Balance form anytime the data is available — you can always come back to it from Flight Documents."
          onBackToList={() => router.push("/flight-documents")}
          open={savedDialogOpen}
        />

        <ConfirmationDialog
          confirmLabel="Delete flight plan"
          confirmingLabel="Deleting..."
          description={`This permanently deletes the flight plan for ${flightPlan.aircraft.aircraftIdentification}, its request, and any linked Weight & Balance. This cannot be undone.`}
          icon={Trash2Icon}
          isConfirming={deleteFlightPlan.isExecuting}
          onConfirm={() => deleteFlightPlan.execute({ flightPlanId })}
          onOpenChange={setDeleteConfirmOpen}
          open={deleteConfirmOpen}
          title="Delete Flight Plan?"
        />
      </div>
    </TooltipProvider>
  );
}

function RejectionReasonAction({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="View rejection reason"
            className="fixed bottom-20 right-6 z-30 inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-destructive/40 bg-destructive text-white shadow-lg transition hover:bg-destructive/90 hover:shadow-xl"
            onClick={() => setOpen(true)}
            type="button"
          >
            <MessageSquareWarningIcon className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>View Rejection Reason</p>
        </TooltipContent>
      </Tooltip>

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
