"use client";

import { FileTextIcon, ScaleIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanForm } from "@/modules/flight-documents/components/flight-plan-form";
import { FlightPlanHelp } from "@/modules/flight-documents/components/flight-plan-help-dialog";
import { FlightPlanSavedDialog } from "@/modules/flight-documents/components/flight-plan-saved-dialog";
import { FlightPlanSavingDialog } from "@/modules/flight-documents/components/flight-plan-saving-dialog";
import { PendingApprovalAlert } from "@/modules/flight-documents/components/pending-approval-alert";
import { RejectionReasonAction } from "@/modules/flight-documents/components/rejection-reason-action";
import { SelfApproveAction } from "@/modules/flight-documents/components/self-approve-action";
import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { useDeleteFlightPlan } from "@/modules/flight-documents/hooks/use-delete-flight-plan.action";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { canActOnFlightRequest } from "@/modules/flight-documents/utils/flight-request-eligibility";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useUpdateFlightPlan } from "@/modules/flight-documents/hooks/use-update-flight-plan.action";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { PageHeader } from "@/shared/components/layout/page-header";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";

export function FlightPlanEditClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const { flightPlan, error, isPending } =
    useOwnFlightPlanForEdit(flightPlanId);
  const updateFlightPlan = useUpdateFlightPlan({
    onSaved: () => setSavedDialogOpen(true),
  });
  const deleteFlightPlan = useDeleteFlightPlan({
    onDeleted: () => router.replace("/flight-documents"),
  });
  const { filerContext } = useFlightPlanFilerContext();

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
  // completed history) renders the same page as a read-only viewer — and
  // so does someone else's plan opened by a reviewer, whatever its status.
  const isEditable = EDITABLE_FLIGHT_REQUEST_STATUSES.some(
    (status) => status === flightPlan.requestStatus,
  );
  const readOnly = !isEditable || !flightPlan.isOwner;
  const isPendingApproval = flightPlan.requestStatus === "pending_approval";

  const isRejected =
    flightPlan.requestStatus === "rejected" && flightPlan.rejectedReason;

  const pageTitle = readOnly ? "View Flight Plan" : "Edit Flight Plan";

  return (
    <div className="sm:space-y-4">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
          {
            href: `/flight-documents/flight-plans/${flightPlanId}`,
            label: pageTitle,
          },
        ]}
        title={pageTitle}
      />

      <AircraftHeaderCard
        aircraft={flightPlan.aircraft}
        status={flightPlan.requestStatus}
      />

      {isPendingApproval && flightPlan.isOwner && (
        <div className="grid gap-2.5 p-3 sm:gap-4 sm:p-0">
          <PendingApprovalAlert flightPlanId={flightPlanId} />
          {filerContext &&
            filerContext.hasValidLicense &&
            canActOnFlightRequest({
              viewerId: filerContext.profile.id,
              viewerCanCommandAsPic: filerContext.canSetSelfAsPic,
              pilotInCommandId: flightPlan.values.pilotInCommandId || null,
              instructorProfileId: flightPlan.values.instructorId || null,
            }) && <SelfApproveAction flightPlanId={flightPlanId} />}
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

      {isEditable && flightPlan.isOwner && (
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
        <RejectionReasonAction
          className="bottom-19 sm:bottom-24"
          reason={flightPlan.rejectedReason ?? ""}
        />
      )}

      <FlightPlanSavingDialog open={updateFlightPlan.isExecuting} />

      <FlightPlanSavedDialog
        description="Your changes are saved. Continue to the Weight & Balance when you are ready — closing this keeps you on the flight plan."
        onBackToList={() => router.replace("/flight-documents")}
        onClose={() => setSavedDialogOpen(false)}
        onProceedToWeightBalance={() =>
          router.replace(
            `/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
          )
        }
        open={savedDialogOpen}
        title="Flight Plan Updated"
      />

      <ConfirmationDialog
        confirmLabel="Delete flight plan"
        confirmingLabel="Deleting..."
        description={`This permanently deletes the flight plan for ${flightPlan.aircraft.registrationMark}, its request, and any linked Weight & Balance. This cannot be undone.`}
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
