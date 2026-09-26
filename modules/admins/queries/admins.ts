import { queryOptions } from "@tanstack/react-query";

import { ADMINS_QUERY_KEYS } from "@/modules/admins/queries/query-keys";
import { fetchAdminsPage } from "@/modules/admins/services/admins.client";

export { ADMINS_QUERY_KEYS };

export function adminsQueryOptions(page: number, pageSize: number, search: string) {
  return queryOptions({
    queryFn: () => fetchAdminsPage(page, pageSize, search),
    queryKey: ADMINS_QUERY_KEYS.list(page, pageSize, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
