"use client";

import { useQuery } from "@tanstack/react-query";

import { aircraftTypeBaggageAreasQueryOptions } from "@/modules/aircrafts/queries/aircraft-types";

export function useAircraftTypeBaggageAreas(
  typeKey: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const query = useQuery({
    ...aircraftTypeBaggageAreasQueryOptions(typeKey),
    enabled: enabled && Boolean(typeKey),
  });

  return {
    baggageAreas: query.data ?? [],
    error: query.error,
    isPending: query.isPending,
  };
}
