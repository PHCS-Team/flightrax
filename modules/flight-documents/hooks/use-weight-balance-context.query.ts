"use client";

import { useQuery } from "@tanstack/react-query";

import { weightBalanceContextQueryOptions } from "@/modules/flight-documents/queries/weight-balance";

export function useWeightBalanceContext(flightPlanId: string) {
  const query = useQuery(weightBalanceContextQueryOptions(flightPlanId));

  return {
    context: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
