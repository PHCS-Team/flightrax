"use client";

import { ClipboardCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanReviewCard } from "@/modules/flight-documents/components/flight-plan-review-card";
import { FlightRequestReviewActions } from "@/modules/flight-documents/components/flight-request-review-actions";
import { WeightBalanceReviewCard } from "@/modules/flight-documents/components/weight-balance-review-card";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
import { canActOnFlightRequest } from "@/modules/flight-documents/utils/flight-request-eligibility";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";

export function FlightRequestReviewClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const flightPlanQuery = useOwnFlightPlanForEdit(flightPlanId);
  const weightBalanceQuery = useWeightBalanceContext(flightPlanId);
  const { filerContext } = useFlightPlanFilerContext();

  if (flightPlanQuery.isPending || weightBalanceQuery.isPending) {
    return <LoadingScreen />;
  }

  const error = flightPlanQuery.error ?? weightBalanceQuery.error;

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight request could not be loaded"
      />
    );
  }

  const flightPlan = flightPlanQuery.flightPlan;

  if (!flightPlan) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/flight-requests")} type="button">
            Back to flight requests
          </Button>
        }
        description="This flight request does not exist or you do not have permission to review it."
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight Request Not Found"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <AircraftHeaderCard
        aircraft={flightPlan.aircraft}
        status={flightPlan.requestStatus}
      />

      <FlightPlanReviewCard
        aircraft={flightPlan.aircraft}
        filedByName={flightPlan.filedByName}
        instructorName={flightPlan.instructorName}
        values={flightPlan.values}
      />

      <div className="mt-1.5 sm:mt-4">
        <WeightBalanceReviewCard context={weightBalanceQuery.context} />
      </div>

      <FlightRequestReviewActions
        canReview={Boolean(
          filerContext &&
            canActOnFlightRequest({
              viewerId: filerContext.profile.id,
              viewerCanCommandAsPic: filerContext.canSetSelfAsPic,
              pilotInCommandId: flightPlan.values.pilotInCommandId || null,
              instructorProfileId: flightPlan.values.instructorId || null,
            }),
        )}
        flightPlanId={flightPlanId}
        requestStatus={flightPlan.requestStatus}
      />
    </div>
  );
}
