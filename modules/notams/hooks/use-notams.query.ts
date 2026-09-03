"use client";

import { useQuery } from "@tanstack/react-query";

import { notamsQueryOptions } from "@/modules/notams/queries/notams";

type SeverityFilter = "" | "advisory" | "warning" | "alert";

export function useNotams(
  page: number,
  pageSize: number,
  search: string,
  severity: SeverityFilter,
  expiry: string,
) {
  const { data, ...rest } = useQuery(
    notamsQueryOptions(page, pageSize, search, severity, expiry),
  );

  return {
    ...rest,
    notams: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
  };
}