import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import {
  fetchFlightPlanAircraft,
  fetchFlightPlanAircraftOptionsPage,
  fetchFlightPlanTypeOptions,
} from "@/modules/flight-documents/services/aircraft-options.client";

export function flightPlanAircraftOptionsInfiniteQueryOptions(
  pageSize: number,
  search: string,
  typeKey: string,
) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      fetchFlightPlanAircraftOptionsPage(pageParam, pageSize, search, typeKey),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.aircraftOptions(
      pageSize,
      search,
      typeKey,
    ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}

export function flightPlanAircraftQueryOptions(aircraftId: string) {
  return queryOptions({
    queryFn: () => fetchFlightPlanAircraft(aircraftId),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.aircraft(aircraftId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(aircraftId),
  });
}

export function flightPlanTypeOptionsQueryOptions() {
  return queryOptions({
    queryFn: fetchFlightPlanTypeOptions,
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.typeOptions,
    staleTime: 10 * 60 * 1000,
  });
}
