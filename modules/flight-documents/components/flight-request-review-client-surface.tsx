"use client";

import { CheckIcon, ClipboardCheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanReviewCard } from "@/modules/flight-documents/components/flight-plan-review-card";
import { WeightBalanceReviewCard } from "@/modules/flight-documents/components/weight-balance-review-card";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
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
      <AircraftHeaderCard aircraft={flightPlan.aircraft} />

      <FlightPlanReviewCard
        aircraft={flightPlan.aircraft}
        values={flightPlan.values}
      />

      <div className="mt-1.5 sm:mt-4">
        <WeightBalanceReviewCard context={weightBalanceQuery.context} />
      </div>

      <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:p-0">
        <Button
          className="border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50"
          type="button"
          variant="outline"
        >
          <XIcon className="size-4" />
          Reject request
        </Button>
        <Button type="button">
          <CheckIcon className="size-4" />
          Approve request
        </Button>
      </div>
    </div>
  );
}
