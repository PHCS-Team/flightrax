import { queryOptions } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { fetchDashboardFlightStatusPage } from "@/modules/dashboard/services/flight-status.client";

export function dashboardFlightStatusQueryOptions(
  page: number,
  pageSize: number,
) {
  return queryOptions({
    queryFn: () => fetchDashboardFlightStatusPage(page, pageSize),
    queryKey: DASHBOARD_QUERY_KEYS.flightStatus(page, pageSize),
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}
