import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { StudentReviewPage } from "@/modules/auth/components/student-review-page";
import { getStudentReviewItems } from "@/modules/auth/services/student-review.server";
import { getQueryClient } from "@/shared/lib/query-client";
import { STUDENT_REVIEW_QUERY_KEYS } from "@/shared/lib/query-keys";

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
