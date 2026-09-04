"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { notamsInfiniteQueryOptions } from "@/modules/notams/queries/notams";
import type {
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";

export function useNotams(
  pageSize: number,
  search: string,
  status: NotamStatusFilter,
  severity: NotamSeverityFilter,
) {
  const query = useInfiniteQuery(
    notamsInfiniteQueryOptions(pageSize, search, status, severity),
  );
  const pages = query.data?.pages ?? [];

  return {
    notams: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount ?? 0,
    error: query.error,
    isPending: query.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
