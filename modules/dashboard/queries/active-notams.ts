import { queryOptions } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { fetchActiveNotams } from "@/modules/dashboard/services/active-notams.client";

export function activeNotamsQueryOptions() {
  return queryOptions({
    queryFn: fetchActiveNotams,
    queryKey: DASHBOARD_QUERY_KEYS.activeNotams,
    staleTime: 60 * 1000,
  });
}
