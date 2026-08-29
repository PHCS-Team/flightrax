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
    staleTime: 0,
  });
}

export function flightPlanPicOptionsQueryOptions() {
  return queryOptions({
    queryFn: fetchFlightPlanPicOptions,
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.picOptions,
    staleTime: 0,
  });
}
