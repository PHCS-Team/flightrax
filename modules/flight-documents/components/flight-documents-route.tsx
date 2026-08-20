import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { FlightDocumentsPage } from "@/modules/flight-documents/components/flight-documents-page";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { getOwnFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.server";
import { getQueryClient } from "@/shared/lib/query-client";

export async function FlightDocumentsRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.requests(1, 9, "draft"),
    queryFn: () => getOwnFlightRequestsPage(1, 9, "draft"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FlightDocumentsPage />
    </HydrationBoundary>
  );
}
