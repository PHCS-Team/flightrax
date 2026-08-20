"use client";

import { useQuery } from "@tanstack/react-query";

import { flightPlanTypeOptionsQueryOptions } from "@/modules/flight-documents/queries/aircraft-options";

export function useFlightPlanTypeOptions(
  { enabled = true }: { enabled?: boolean } = {},
) {
  const query = useQuery({
    ...flightPlanTypeOptionsQueryOptions(),
    enabled,
  });

  return {
    typeOptions: query.data ?? [],
    error: query.error,
    isPending: query.isPending,
  };
}
