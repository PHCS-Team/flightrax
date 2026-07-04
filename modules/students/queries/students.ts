import { queryOptions } from "@tanstack/react-query";

import { fetchApprovedStudents } from "@/modules/students/services/students.client";
import { STUDENTS_QUERY_KEYS } from "@/shared/lib/query-keys";

export { STUDENTS_QUERY_KEYS };

export function approvedStudentsQueryOptions() {
  return queryOptions({
    queryFn: fetchApprovedStudents,
    queryKey: STUDENTS_QUERY_KEYS.approved,
    staleTime: 5 * 60 * 1000,
  });
}
