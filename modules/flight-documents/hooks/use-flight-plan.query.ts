"use client";

import { useQuery } from "@tanstack/react-query";

import { ownFlightPlanForEditQueryOptions } from "@/modules/flight-documents/queries/flight-plans";

export function useOwnFlightPlanForEdit(flightPlanId: string) {
  const query = useQuery(ownFlightPlanForEditQueryOptions(flightPlanId));

  return {
    flightPlan: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
