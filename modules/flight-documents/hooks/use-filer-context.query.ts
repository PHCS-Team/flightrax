"use client";

import { useQuery } from "@tanstack/react-query";

import { flightPlanFilerContextQueryOptions } from "@/modules/flight-documents/queries/flight-plan-filer";

export function useFlightPlanFilerContext() {
  const query = useQuery(flightPlanFilerContextQueryOptions());

  return {
    filerContext: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
