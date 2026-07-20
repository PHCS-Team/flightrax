"use client";

import { useQuery } from "@tanstack/react-query";

import { aircraftWeightBalanceQueryOptions } from "@/modules/aircrafts/queries/aircraft-weight-balance";

export function useAircraftWeightBalance(aircraftId: string) {
  const query = useQuery(aircraftWeightBalanceQueryOptions(aircraftId));

  return {
    config: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
