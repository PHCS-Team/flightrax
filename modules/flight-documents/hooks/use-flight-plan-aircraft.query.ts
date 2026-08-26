"use client";

import { useQuery } from "@tanstack/react-query";

import { flightPlanAircraftQueryOptions } from "@/modules/flight-documents/queries/aircraft-options";

export function useFlightPlanAircraft(aircraftId: string) {
  const query = useQuery(flightPlanAircraftQueryOptions(aircraftId));

  return {
    aircraft: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
