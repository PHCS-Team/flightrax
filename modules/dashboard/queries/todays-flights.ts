import { queryOptions } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { fetchTodaysFlightsPage } from "@/modules/dashboard/services/todays-flights.client";

export function todaysFlightsQueryOptions(
  page: number,
  pageSize: number,
  search: string,
) {
  return queryOptions({
    queryFn: () => fetchTodaysFlightsPage(page, pageSize, search),
    queryKey: DASHBOARD_QUERY_KEYS.todaysFlights(page, pageSize, search),
    // Monitoring data: always refetch on mount; realtime invalidation
    // keeps it live afterwards.
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}
