"use client";

import { useQuery } from "@tanstack/react-query";

import { aircraftTypesQueryOptions } from "@/modules/aircrafts/queries/aircraft-types";

export function useAircraftTypes() {
  const query = useQuery(aircraftTypesQueryOptions());

  return {
    aircraftTypes: query.data ?? [],
    error: query.error,
    isPending: query.isPending,
  };
}
