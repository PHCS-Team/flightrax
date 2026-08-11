import { queryOptions } from "@tanstack/react-query";

import { fetchOwnLicenses } from "@/modules/auth/services/licenses.client";

export const LICENSE_QUERY_KEYS = {
  all: ["auth", "licenses"] as const,
  list: ["auth", "licenses", "list"] as const,
};

export function licensesQueryOptions() {
  return queryOptions({
    queryFn: fetchOwnLicenses,
    queryKey: LICENSE_QUERY_KEYS.list,
    staleTime: 5 * 60 * 1000,
  });
}
