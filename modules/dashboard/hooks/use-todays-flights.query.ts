"use client";

import { useQuery } from "@tanstack/react-query";

import { todaysFlightsQueryOptions } from "@/modules/dashboard/queries/todays-flights";

export function useTodaysFlights(
  page: number,
  pageSize: number,
  search: string,
  enabled: boolean,
) {
  const query = useQuery({
    ...todaysFlightsQueryOptions(page, pageSize, search),
    // Only fetch while the drawer is open.
    enabled,
  });

  return {
    ...query,
    rows: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
  };
}
