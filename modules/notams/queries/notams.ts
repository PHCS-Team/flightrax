import { queryOptions } from "@tanstack/react-query";

import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { fetchNotamsPage } from "@/modules/notams/services/notams.client";

export { NOTAMS_QUERY_KEYS };

type SeverityFilter = "" | "advisory" | "warning" | "alert";

export function notamsQueryOptions(
  page: number,
  pageSize: number,
  search: string,
  severity: SeverityFilter,
  expiry: string,
) {
  return queryOptions({
    queryFn: () => fetchNotamsPage(page, pageSize, search, severity, expiry),
    queryKey: NOTAMS_QUERY_KEYS.list(page, pageSize, search, severity, expiry),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}