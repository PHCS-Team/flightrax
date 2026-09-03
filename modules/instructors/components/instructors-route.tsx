import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { InstructorsPage } from "@/modules/instructors/components/instructors-page";
import { INSTRUCTORS_MANAGE } from "@/modules/instructors/constants/permissions";
import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { getApprovedInstructorsPage } from "@/modules/instructors/services/instructors.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission, ROLE } from "@/shared/lib/rbac/config";
import { CREDENTIALS_VIEW_DETAILS } from "@/shared/lib/rbac/permissions";
import { getQueryClient } from "@/shared/lib/query-client";
import type { CredentialAccess } from "@/shared/types/credential-access";

export async function InstructorsRoute() {
  const queryClient = getQueryClient();
  const [viewer] = await Promise.all([
    getCurrentAuthorizationProfile(),
    queryClient.prefetchQuery({
      queryKey: INSTRUCTORS_QUERY_KEYS.approved(1, 10, ""),
      queryFn: () => getApprovedInstructorsPage(1, 10, ""),
    }),
  ]);

  // Instructors hold the credentials permission for the student
  // directory, but peer privacy limits them to their own row here.
  const credentialAccess: CredentialAccess =
    viewer?.role === ROLE.INSTRUCTOR
      ? "own"
      : viewer &&
          hasPermission(
            viewer.role,
            CREDENTIALS_VIEW_DETAILS,
            viewer.admin_department,
          )
        ? "all"
        : "none";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InstructorsPage
        canManageAvailability={
          viewer
            ? hasPermission(
                viewer.role,
                INSTRUCTORS_MANAGE,
                viewer.admin_department,
              )
            : false
        }
        credentialAccess={credentialAccess}
        showPeerPrivacyNote={viewer?.role === ROLE.INSTRUCTOR}
        viewerId={viewer?.id ?? null}
      />
    </HydrationBoundary>
  );
}
