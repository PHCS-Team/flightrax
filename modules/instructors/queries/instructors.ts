import { queryOptions } from "@tanstack/react-query";

import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { fetchApprovedInstructorsPage } from "@/modules/instructors/services/instructors.client";

export { INSTRUCTORS_QUERY_KEYS };

export function approvedInstructorsQueryOptions(
  page: number,
  pageSize: number,
  search: string,
) {
  return queryOptions({
    queryFn: () => fetchApprovedInstructorsPage(page, pageSize, search),
    queryKey: INSTRUCTORS_QUERY_KEYS.approved(page, pageSize, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
