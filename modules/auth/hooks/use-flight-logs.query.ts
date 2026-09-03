"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { accountFlightLogsInfiniteQueryOptions } from "@/modules/auth/queries/flight-logs";

export function useAccountFlightLogs(pageSize: number) {
  const query = useInfiniteQuery(
    accountFlightLogsInfiniteQueryOptions(pageSize),
  );
  const pages = query.data?.pages ?? [];

  return {
    logs: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount ?? 0,
    error: query.error,
    isPending: query.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
