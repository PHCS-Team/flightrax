import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchOwnFlightPlanForEdit } from "@/modules/flight-documents/services/flight-plans.client";

export function ownFlightPlanForEditQueryOptions(flightPlanId: string) {
  return queryOptions({
    queryFn: () => fetchOwnFlightPlanForEdit(flightPlanId),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.flightPlan(flightPlanId),
    // Always refetch on mount: status can change server-side (approval,
    // rejection) and stale form defaults would mislead the editor.
    staleTime: 0,
    enabled: Boolean(flightPlanId),
  });
}
