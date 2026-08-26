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
import { FlightPlanSavingDialog } from "@/modules/flight-documents/components/flight-plan-saving-dialog";
import { PendingApprovalAlert } from "@/modules/flight-documents/components/pending-approval-alert";
import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { useDeleteFlightPlan } from "@/modules/flight-documents/hooks/use-delete-flight-plan.action";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useUpdateFlightPlan } from "@/modules/flight-documents/hooks/use-update-flight-plan.action";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

export function FlightPlanEditClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { flightPlan, error, isPending } =
    useOwnFlightPlanForEdit(flightPlanId);
  // Saving is the only road to the Weight & Balance step — the plan must
  // be persisted (changed or not) before moving on.
  const updateFlightPlan = useUpdateFlightPlan({
    onSaved: () =>
      router.push(
        `/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
      ),
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

  // Any status outside the editable set (pending approval, approved,
  // completed history) renders the same page as a read-only viewer.
  const isEditable = EDITABLE_FLIGHT_REQUEST_STATUSES.some(
    (status) => status === flightPlan.requestStatus,
  );
  const readOnly = !isEditable;
  const isPendingApproval = flightPlan.requestStatus === "pending_approval";

  const isRejected =
    flightPlan.requestStatus === "rejected" && flightPlan.rejectedReason;

  return (
    <div className="sm:space-y-4">
      <AircraftHeaderCard aircraft={flightPlan.aircraft} />

      {isPendingApproval && (
        <div className="p-3 sm:p-0">
          <PendingApprovalAlert flightPlanId={flightPlanId} />
        </div>
      )}

      <GlassSurface className="p-4 sm:p-6">
        <FlightPlanForm
          cancelLabel="Back to flight documents"
          defaultValues={flightPlan.values}
          isSubmitting={updateFlightPlan.isExecuting}
          onCancel={() => router.push("/flight-documents")}
          onReadOnlyAction={() =>
            router.push(
              `/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
            )
          }
          onSubmit={(values) =>
            updateFlightPlan.execute({ ...values, flightPlanId })
          }
          readOnly={readOnly}
          readOnlyActionLabel="View Weight & Balance"
          submitLabel="Save and continue to Weight & Balance"
        />
      </GlassSurface>

      {isEditable && (
        <div className="flex flex-col gap-2 border-t border-primary-foreground/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:p-0">
          <p className="text-xs text-primary-foreground/60">
            No longer need this flight plan? Deleting removes it along with its
            request and Weight &amp; Balance.
          </p>
          <Button
            className="shrink-0 border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50 disabled:cursor-default h-10 "
            disabled={deleteFlightPlan.isExecuting}
            onClick={() => setDeleteConfirmOpen(true)}
            type="button"
            variant="outline"
          >
            <Trash2Icon className="size-4" />
            Delete flight plan
          </Button>
        </div>
      )}

      {readOnly ? (
        <FloatingActionButton
          className="sm:hidden"
          icon={ScaleIcon}
          label="View Weight & Balance"
          onClick={() =>
            router.push(
              `/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
            )
          }
        />
      ) : (
        <FlightPlanHelp />
      )}

      {isRejected && (
        <RejectionReasonAction reason={flightPlan.rejectedReason ?? ""} />
      )}

      <FlightPlanSavingDialog open={updateFlightPlan.isExecuting} />

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
        typeToConfirm="DELETE THIS!"
      />
    </div>
  );
}

function RejectionReasonAction({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingActionButton
        className="bottom-20"
        icon={MessageSquareWarningIcon}
        label="View Rejection Reason"
        onClick={() => setOpen(true)}
        variant="destructive"
      />

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
