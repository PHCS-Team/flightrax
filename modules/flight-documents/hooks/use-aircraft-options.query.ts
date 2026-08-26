"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { flightPlanAircraftOptionsInfiniteQueryOptions } from "@/modules/flight-documents/queries/aircraft-options";

export function useFlightPlanAircraftOptions(
  pageSize: number,
  search: string,
  typeKey: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const query = useInfiniteQuery({
    ...flightPlanAircraftOptionsInfiniteQueryOptions(pageSize, search, typeKey),
    enabled,
  });
  const pages = query.data?.pages ?? [];

  return {
    aircraftOptions: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount ?? 0,
    error: query.error,
    isPending: query.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
