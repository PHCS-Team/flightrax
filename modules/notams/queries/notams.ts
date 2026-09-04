import { infiniteQueryOptions } from "@tanstack/react-query";

import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { fetchNotamsPage } from "@/modules/notams/services/notams.client";
import type {
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";

export { NOTAMS_QUERY_KEYS };

export function notamsInfiniteQueryOptions(
  pageSize: number,
  search: string,
  status: NotamStatusFilter,
  severity: NotamSeverityFilter,
) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      fetchNotamsPage(pageParam, pageSize, search, status, severity),
    queryKey: NOTAMS_QUERY_KEYS.list(pageSize, search, status, severity),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}
