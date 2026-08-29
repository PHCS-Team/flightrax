import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { FlightRequestsPage } from "@/modules/flight-documents/components/flight-requests-page";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { getReviewFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.server";
import { getQueryClient } from "@/shared/lib/query-client";

export async function FlightRequestsRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.reviewRequests(12, "assigned", ""),
    queryFn: () => getReviewFlightRequestsPage(1, 12, "assigned", ""),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FlightRequestsPage />
    </HydrationBoundary>
  );
}
