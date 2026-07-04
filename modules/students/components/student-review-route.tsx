import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { StudentReviewPage } from "@/modules/students/components/student-review-page";
import { STUDENT_REVIEW_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { getStudentReviewItems } from "@/modules/students/services/student-review.server";
import { getQueryClient } from "@/shared/lib/query-client";

export async function StudentReviewRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: STUDENT_REVIEW_QUERY_KEYS.list,
    queryFn: getStudentReviewItems,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentReviewPage />
    </HydrationBoundary>
  );
}
