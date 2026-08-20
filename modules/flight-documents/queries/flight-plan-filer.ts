import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import {
  fetchFlightPlanFilerContext,
  fetchFlightPlanPicOptions,
} from "@/modules/flight-documents/services/flight-plan-filer.client";

export function flightPlanFilerContextQueryOptions() {
  return queryOptions({
    queryFn: fetchFlightPlanFilerContext,
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.filerContext,
    // Signature and licenses are edited in account settings, outside this
    // module's mutation flow — always refetch on mount so returning from
    // account settings picks the changes up.
    staleTime: 0,
  });
}

export function flightPlanPicOptionsQueryOptions() {
  return queryOptions({
    queryFn: fetchFlightPlanPicOptions,
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.picOptions,
    staleTime: 5 * 60 * 1000,
  });
}
