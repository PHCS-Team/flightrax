import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchOwnFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.client";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";

export function ownFlightRequestsQueryOptions(
  page: number,
  pageSize: number,
  status: FlightRequestStatus,
) {
  // No placeholderData here on purpose: it would carry the previous
  // tab's rows and counts into the new key, flashing stale data labeled
  // with the wrong status while the real page loads.
  return queryOptions({
    queryFn: () => fetchOwnFlightRequestsPage(page, pageSize, status),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.requests(page, pageSize, status),
    staleTime: 60 * 1000,
  });
}
