"use client";

import { ScaleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanSavedDialog } from "@/modules/flight-documents/components/flight-plan-saved-dialog";
import { FlightPlanSavingDialog } from "@/modules/flight-documents/components/flight-plan-saving-dialog";
import { WeightBalanceForm } from "@/modules/flight-documents/components/weight-balance-form";
import { WeightBalanceHelp } from "@/modules/flight-documents/components/weight-balance-help-dialog";
import { PendingApprovalAlert } from "@/modules/flight-documents/components/pending-approval-alert";
import { RejectionReasonAction } from "@/modules/flight-documents/components/rejection-reason-action";
import { SelfApproveAction } from "@/modules/flight-documents/components/self-approve-action";
import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useSaveWeightBalance } from "@/modules/flight-documents/hooks/use-save-weight-balance.action";
import { useSubmitFlightRequest } from "@/modules/flight-documents/hooks/use-submit-flight-request.action";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";

export function WeightBalanceClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const { context, error, isPending } = useWeightBalanceContext(flightPlanId);
  const { filerContext } = useFlightPlanFilerContext();
  const isSelfPic = Boolean(
    context &&
    filerContext &&
    context.pilotInCommandId === filerContext.profile.id,
  );
  const saveWeightBalance = useSaveWeightBalance({
    onSaved: () => setSavedDialogOpen(true),
  });

  const submitFlightRequest = useSubmitFlightRequest({
    onSubmitted: () =>
      router.replace(`/flight-documents/flight-plans/${flightPlanId}`),
  });

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<ScaleIcon className="size-7" />}
        title="Weight & Balance could not be loaded"
      />
    );
  }

  if (!context) {
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
        icon={<ScaleIcon className="size-7" />}
        title="Flight Plan Not Found"
      />
    );
  }

  const isEditable = EDITABLE_FLIGHT_REQUEST_STATUSES.some(
    (status) => status === context.requestStatus,
  );
  const readOnly = !isEditable || !context.isOwner;
  const isPendingApproval = context.requestStatus === "pending_approval";

  if (!context.givens) {
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
        description="This aircraft's Weight & Balance configuration is incomplete — contact your admin before filing."
        icon={<ScaleIcon className="size-7" />}
        title="Aircraft Needs Admin Setup"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <AircraftHeaderCard
        aircraft={context.aircraft}
        status={context.requestStatus}
      />

      {isPendingApproval && context.isOwner && (
        <div className="grid gap-2 p-3 sm:gap-3 sm:p-0">
          <PendingApprovalAlert flightPlanId={flightPlanId} />
          {isSelfPic && filerContext?.hasValidLicense && (
            <SelfApproveAction flightPlanId={flightPlanId} />
          )}
        </div>
      )}

      <GlassSurface className="p-4 sm:p-6">
        <WeightBalanceForm
          cancelLabel="Back to flight plan"
          defaultValues={context.existing ?? undefined}
          givens={context.givens}
          isSubmitting={saveWeightBalance.isExecuting}
          onCancel={() =>
            router.push(`/flight-documents/flight-plans/${flightPlanId}`)
          }
          onSubmit={(values) =>
            saveWeightBalance.execute({ ...values, flightPlanId })
          }
          readOnly={readOnly}
          submitLabel={
            context.weightBalanceId
              ? "Save and submit"
              : "Save weight and balance"
          }
        />
      </GlassSurface>

      {!readOnly && <WeightBalanceHelp />}

      {context.requestStatus === "rejected" && context.rejectedReason && (
        <RejectionReasonAction
          className="bottom-24"
          reason={context.rejectedReason}
        />
      )}

      <FlightPlanSavingDialog
        message="Saving your weight and balance..."
        open={saveWeightBalance.isExecuting}
      />

      <FlightPlanSavedDialog
        description="Your Weight & Balance is saved. Submit the request for approval when everything is final, or come back to it later from Flight Documents."
        isSubmittingForApproval={submitFlightRequest.isExecuting}
        onBackToList={() => router.replace("/flight-documents")}
        onClose={() =>
          router.replace(`/flight-documents/flight-plans/${flightPlanId}`)
        }
        onSubmitForApproval={() =>
          submitFlightRequest.execute({ flightPlanId })
        }
        open={savedDialogOpen}
        showProceed={false}
        submitForApprovalLabel={
          context.requestStatus === "rejected"
            ? "Resubmit request for approval"
            : "Submit request for approval"
        }
        title="Weight & Balance Saved"
      />
    </div>
  );
}
