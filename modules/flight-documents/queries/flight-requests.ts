import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchOwnFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.client";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";

export function ownFlightRequestsQueryOptions(
  page: number,
  pageSize: number,
  status: FlightRequestStatus,
  search: string,
) {
  return queryOptions({
    queryFn: () => fetchOwnFlightRequestsPage(page, pageSize, status, search),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.requests(
      page,
      pageSize,
      status,
      search,
    ),
    staleTime: 60 * 1000,
  });
}
