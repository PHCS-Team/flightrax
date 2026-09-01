import { infiniteQueryOptions } from "@tanstack/react-query";

import { fetchAccountFlightLogsPage } from "@/modules/auth/services/flight-logs.client";

export const FLIGHT_LOG_QUERY_KEYS = {
  all: ["auth", "flight-logs"] as const,
  list: (pageSize: number) =>
    ["auth", "flight-logs", { pageSize }] as const,
};

export function accountFlightLogsInfiniteQueryOptions(pageSize: number) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) => fetchAccountFlightLogsPage(pageParam, pageSize),
    queryKey: FLIGHT_LOG_QUERY_KEYS.list(pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}
