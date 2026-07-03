import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { StudentsPage } from "@/modules/students/components/students-page";
import { getApprovedStudentsForAuthorizedViewer } from "@/modules/students/services/students.server";
import { getQueryClient } from "@/shared/lib/query-client";
import { STUDENTS_QUERY_KEYS } from "@/shared/lib/query-keys";

export async function StudentsRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: STUDENTS_QUERY_KEYS.approved,
    queryFn: getApprovedStudentsForAuthorizedViewer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentsPage />
    </HydrationBoundary>
  );
}
