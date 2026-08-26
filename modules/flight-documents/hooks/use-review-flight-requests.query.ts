"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { reviewFlightRequestsInfiniteQueryOptions } from "@/modules/flight-documents/queries/flight-requests";
import type { FlightRequestReviewScope } from "@/modules/flight-documents/types/flight-request";

export function useReviewFlightRequests(
  pageSize: number,
  scope: FlightRequestReviewScope,
  search: string,
) {
  const query = useInfiniteQuery(
    reviewFlightRequestsInfiniteQueryOptions(pageSize, scope, search),
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
