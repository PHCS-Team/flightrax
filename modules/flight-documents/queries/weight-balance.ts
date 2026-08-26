import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchWeightBalanceContext } from "@/modules/flight-documents/services/weight-balance.client";

export function weightBalanceContextQueryOptions(flightPlanId: string) {
  return queryOptions({
    queryFn: () => fetchWeightBalanceContext(flightPlanId),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.weightBalance(flightPlanId),
    // Always refetch on mount: the givens come from live aircraft/type
    // configuration and the request status can change server-side.
    staleTime: 0,
    enabled: Boolean(flightPlanId),
  });
}
