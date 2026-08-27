"use client";

import { useRouter } from "next/navigation";
import type { Ref } from "react";

import {
  FLIGHT_REQUEST_STATUS_PILLS,
  FlightRequestRowCard,
  WeightBalanceBadge,
} from "@/modules/flight-documents/components/flight-request-row-card";
import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import type { FlightRequestListItem } from "@/modules/flight-documents/types/flight-request";

export function FlightDocumentsList({
  isFetchingNextPage,
  requests,
  sentinelRef,
}: {
  isFetchingNextPage: boolean;
  requests: FlightRequestListItem[];
  sentinelRef: Ref<HTMLDivElement>;
}) {
  const router = useRouter();

  return (
    <div className="grid sm:gap-2.5">
      {requests.map((request) => (
        <FlightRequestRowCard
          actionLabel={
            EDITABLE_FLIGHT_REQUEST_STATUSES.some(
              (status) => status === request.status,
            )
              ? "Click to open"
              : "Click to view"
          }
          aircraftIdentification={request.aircraftIdentification}
          aircraftPhotoUrl={request.aircraftPhotoUrl}
          departureAerodrome={request.departureAerodrome}
          destinationAerodrome={request.destinationAerodrome}
          key={request.id}
          onOpen={() =>
            router.push(`/flight-documents/flight-plans/${request.flightPlanId}`)
          }
          pill={FLIGHT_REQUEST_STATUS_PILLS[request.status]}
          planCode={request.planCode}
          tone={request.status === "rejected" ? "destructive" : "default"}
        >
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-foreground/70">
            <span>
              DOF{" "}
              <span className="font-semibold text-primary-foreground/90">
                {request.dofRaw}
              </span>
            </span>
            <span>
              Updated{" "}
              {new Date(request.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <WeightBalanceBadge hasWeightBalance={request.hasWeightBalance} />
          </div>
        </FlightRequestRowCard>
      ))}

      <div aria-hidden="true" ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-3 text-center text-sm text-primary-foreground/70">
          Loading more flight plans...
        </p>
      )}
    </div>
  );
}
