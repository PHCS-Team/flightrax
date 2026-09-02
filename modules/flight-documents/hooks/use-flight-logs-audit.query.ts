"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { flightLogsAuditInfiniteQueryOptions } from "@/modules/flight-documents/queries/flight-logs-audit";

export function useFlightLogsAudit(
  pageSize: number,
  search: string,
  status: string,
) {
  const query = useInfiniteQuery(
    flightLogsAuditInfiniteQueryOptions(pageSize, search, status),
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
