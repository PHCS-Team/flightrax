import { queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { fetchFlightDocumentsExport } from "@/modules/flight-documents/services/flight-documents-export.client";

export function flightDocumentsExportQueryOptions(flightPlanId: string) {
  return queryOptions({
    queryFn: () => fetchFlightDocumentsExport(flightPlanId),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.documentsExport(flightPlanId),
    staleTime: 60 * 1000,
  });
}
