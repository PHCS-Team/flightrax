import { queryOptions } from "@tanstack/react-query";

import { STUDENT_REVIEW_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { fetchStudentDocumentUrl } from "@/modules/students/services/student-document.client";
import { fetchStudentReviewItems } from "@/modules/students/services/student-review.client";

export { STUDENT_REVIEW_QUERY_KEYS };

export function studentReviewQueryOptions() {
  return queryOptions({
    queryFn: fetchStudentReviewItems,
    queryKey: STUDENT_REVIEW_QUERY_KEYS.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function studentDocumentQueryOptions(
  studentId: string,
  enabled: boolean,
) {
  return queryOptions({
    queryFn: () => fetchStudentDocumentUrl(studentId),
    queryKey: STUDENT_REVIEW_QUERY_KEYS.documentUrl(studentId),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
