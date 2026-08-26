"use client";

import { useQuery } from "@tanstack/react-query";

import { flightPlanPicOptionsQueryOptions } from "@/modules/flight-documents/queries/flight-plan-filer";

export function useFlightPlanPicOptions() {
  const query = useQuery(flightPlanPicOptionsQueryOptions());

  return {
    picOptions: query.data ?? [],
    error: query.error,
    isPending: query.isPending,
  };
}
