import { queryOptions } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { fetchDashboardFlightStatusPage } from "@/modules/dashboard/services/flight-status.client";
import type { DashboardStatusGroup } from "@/modules/dashboard/types/flight-status";

export function dashboardFlightStatusQueryOptions(
  page: number,
  pageSize: number,
  group: DashboardStatusGroup,
) {
  return queryOptions({
    queryFn: () => fetchDashboardFlightStatusPage(page, pageSize, group),
    queryKey: DASHBOARD_QUERY_KEYS.flightStatus(page, pageSize, group),
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}
