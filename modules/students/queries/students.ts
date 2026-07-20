import { queryOptions } from "@tanstack/react-query";

import { STUDENTS_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { fetchApprovedStudentsPage } from "@/modules/students/services/students.client";

export { STUDENTS_QUERY_KEYS };

export function approvedStudentsQueryOptions(page: number, pageSize: number, search: string) {
  return queryOptions({
    queryFn: () => fetchApprovedStudentsPage(page, pageSize, search),
    queryKey: STUDENTS_QUERY_KEYS.approved(page, pageSize, search),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
