import { infiniteQueryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchFlightLogsAuditPage } from "@/modules/flight-documents/services/flight-logs-audit.client";

export function flightLogsAuditInfiniteQueryOptions(
  pageSize: number,
  search: string,
  status: string,
) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      fetchFlightLogsAuditPage(pageParam, pageSize, search, status),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.auditLogs(pageSize, search, status),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}
