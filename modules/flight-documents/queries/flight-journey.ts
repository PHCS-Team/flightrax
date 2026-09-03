import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchFlightJourneyDetails } from "@/modules/flight-documents/services/flight-journey.client";

export function flightJourneyQueryOptions(flightPlanId: string) {
  return queryOptions({
    queryFn: () => fetchFlightJourneyDetails(flightPlanId),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.journey(flightPlanId),
    staleTime: 60 * 1000,
    enabled: Boolean(flightPlanId),
  });
}
