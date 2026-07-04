import { queryOptions } from "@tanstack/react-query";

import { fetchStudentReviewItems } from "@/modules/students/services/student-review.client";
import { STUDENT_REVIEW_QUERY_KEYS } from "@/shared/lib/query-keys";

export { STUDENT_REVIEW_QUERY_KEYS };

export function studentReviewQueryOptions() {
  return queryOptions({
    queryFn: fetchStudentReviewItems,
    queryKey: STUDENT_REVIEW_QUERY_KEYS.list,
    staleTime: 5 * 60 * 1000,
  });
}
