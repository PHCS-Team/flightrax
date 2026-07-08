import { queryOptions } from "@tanstack/react-query";

import { STUDENTS_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { fetchApprovedStudents } from "@/modules/students/services/students.client";

export { STUDENTS_QUERY_KEYS };

export function approvedStudentsQueryOptions() {
  return queryOptions({
    queryFn: fetchApprovedStudents,
    queryKey: STUDENTS_QUERY_KEYS.approved,
    staleTime: 5 * 60 * 1000,
  });
}
