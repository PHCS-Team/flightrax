import { queryOptions } from "@tanstack/react-query";

import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { fetchAircraftsPage } from "@/modules/aircrafts/services/aircrafts.client";

export { AIRCRAFTS_QUERY_KEYS };

export function aircraftsQueryOptions(page: number, pageSize: number, search: string, typeFilter?: string) {
  return queryOptions({
    queryFn: () => fetchAircraftsPage(page, pageSize, search, typeFilter),
    queryKey: AIRCRAFTS_QUERY_KEYS.list(page, pageSize, search, typeFilter),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
