"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { ownFlightRequestsInfiniteQueryOptions } from "@/modules/flight-documents/queries/flight-requests";
import type { FlightRequestStatusGroup } from "@/modules/flight-documents/types/flight-request";

export function useOwnFlightRequests(
  pageSize: number,
  group: FlightRequestStatusGroup,
  search: string,
) {
  const query = useInfiniteQuery(
    ownFlightRequestsInfiniteQueryOptions(pageSize, group, search),
  );
  const pages = query.data?.pages ?? [];

  return {
    requests: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount ?? 0,
    error: query.error,
    isPending: query.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
