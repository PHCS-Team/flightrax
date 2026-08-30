"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardFlightStatusQueryOptions } from "@/modules/dashboard/queries/flight-status";

export function useDashboardFlightStatus(page: number, pageSize: number) {
  const query = useQuery(dashboardFlightStatusQueryOptions(page, pageSize));

  return {
    ...query,
    rows: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
  };
}
