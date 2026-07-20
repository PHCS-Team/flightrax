import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { StudentsPage } from "@/modules/students/components/students-page";
import { STUDENTS_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { getApprovedStudentsPage } from "@/modules/students/services/students.server";
import { getQueryClient } from "@/shared/lib/query-client";

export async function StudentsRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
      queryKey: STUDENTS_QUERY_KEYS.approved(1, 10, ""),
      queryFn: () => getApprovedStudentsPage(1, 10, ""),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentsPage />
    </HydrationBoundary>
  );
}
