import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { StudentsPage } from "@/modules/students/components/students-page";
import { STUDENTS_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { getApprovedStudentsPage } from "@/modules/students/services/students.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { CREDENTIALS_VIEW_DETAILS } from "@/shared/lib/rbac/permissions";
import { getQueryClient } from "@/shared/lib/query-client";
import type { CredentialAccess } from "@/shared/types/credential-access";

export async function StudentsRoute() {
  const queryClient = getQueryClient();
  const [viewer] = await Promise.all([
    getCurrentAuthorizationProfile(),
    queryClient.prefetchQuery({
      queryKey: STUDENTS_QUERY_KEYS.approved(1, 10, ""),
      queryFn: () => getApprovedStudentsPage(1, 10, ""),
    }),
  ]);

  const credentialAccess: CredentialAccess =
    viewer &&
    hasPermission(viewer.role, CREDENTIALS_VIEW_DETAILS, viewer.admin_department)
      ? "all"
      : "none";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentsPage credentialAccess={credentialAccess} />
    </HydrationBoundary>
  );
}
