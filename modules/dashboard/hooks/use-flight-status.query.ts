"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardFlightStatusQueryOptions } from "@/modules/dashboard/queries/flight-status";
import type { DashboardStatusGroup } from "@/modules/dashboard/types/flight-status";

export function useDashboardFlightStatus(
  page: number,
  pageSize: number,
  group: DashboardStatusGroup = "all",
) {
  const query = useQuery(dashboardFlightStatusQueryOptions(page, pageSize, group));

  return {
    ...query,
    rows: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
  };
}
