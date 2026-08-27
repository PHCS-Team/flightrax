import { infiniteQueryOptions } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import {
  fetchOwnFlightRequestsPage,
  fetchReviewFlightRequestsPage,
} from "@/modules/flight-documents/services/flight-requests.client";
import type {
  FlightRequestReviewScope,
  FlightRequestStatusGroup,
} from "@/modules/flight-documents/types/flight-request";

export function ownFlightRequestsInfiniteQueryOptions(
  pageSize: number,
  group: FlightRequestStatusGroup,
  search: string,
) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      fetchOwnFlightRequestsPage(pageParam, pageSize, group, search),
    queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.requests(pageSize, group, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
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
