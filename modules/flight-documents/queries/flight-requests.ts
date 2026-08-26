import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import {
  fetchOwnFlightRequestsPage,
  fetchReviewFlightRequestsPage,
} from "@/modules/flight-documents/services/flight-requests.client";
import type {
  FlightRequestReviewScope,
  FlightRequestStatus,
} from "@/modules/flight-documents/types/flight-request";

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

export function reviewFlightRequestsInfiniteQueryOptions(
  pageSize: number,
  scope: FlightRequestReviewScope,
  search: string,
) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      fetchReviewFlightRequestsPage(pageParam, pageSize, scope, search),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.reviewRequests(
      pageSize,
      scope,
      search,
    ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}
