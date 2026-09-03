"use client";

import { useQuery } from "@tanstack/react-query";

import { flightJourneyQueryOptions } from "@/modules/flight-documents/queries/flight-journey";

export function useFlightJourney(flightPlanId: string) {
  const query = useQuery(flightJourneyQueryOptions(flightPlanId));

  return {
    ...query,
    journey: query.data ?? null,
  };
}
