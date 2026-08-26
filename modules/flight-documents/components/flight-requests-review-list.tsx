"use client";

import { useRouter } from "next/navigation";
import type { Ref } from "react";

import {
  FLIGHT_REQUEST_STATUS_PILLS,
  FlightRequestRowCard,
  WeightBalanceBadge,
} from "@/modules/flight-documents/components/flight-request-row-card";
import type {
  FlightRequestReviewListItem,
  FlightRequestReviewScope,
} from "@/modules/flight-documents/types/flight-request";

export function FlightRequestsReviewList({
  isFetchingNextPage,
  requests,
  scope,
  sentinelRef,
}: {
  isFetchingNextPage: boolean;
  requests: FlightRequestReviewListItem[];
  scope: FlightRequestReviewScope;
  sentinelRef: Ref<HTMLDivElement>;
}) {
  const router = useRouter();

  return (
    <div className="grid sm:gap-2.5">
      {requests.map((request) => (
        <FlightRequestRowCard
          actionLabel="Click to review"
          aircraftIdentification={request.aircraftIdentification}
          aircraftPhotoUrl={request.aircraftPhotoUrl}
          departureAerodrome={request.departureAerodrome}
          destinationAerodrome={request.destinationAerodrome}
          key={request.id}
          onOpen={() => router.push(`/flight-requests/${request.flightPlanId}`)}
          pill={FLIGHT_REQUEST_STATUS_PILLS[request.status]}
          planCode={request.planCode}
        >
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-foreground/70">
            <span className="truncate">By {request.requestedByName}</span>
            {scope === "all" && request.pilotInCommandName && (
              <span className="truncate">PIC {request.pilotInCommandName}</span>
            )}
            <span>
              DOF{" "}
              <span className="font-semibold text-primary-foreground/90">
                {request.dofRaw}
              </span>
            </span>
            <WeightBalanceBadge hasWeightBalance={request.hasWeightBalance} />
          </div>
        </FlightRequestRowCard>
      ))}

      <div aria-hidden="true" ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-3 text-center text-sm text-primary-foreground/70">
          Loading more requests...
        </p>
      )}
    </div>
  );
}
