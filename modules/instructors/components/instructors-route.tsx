import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { InstructorsPage } from "@/modules/instructors/components/instructors-page";
import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { getApprovedInstructorsPage } from "@/modules/instructors/services/instructors.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { getQueryClient } from "@/shared/lib/query-client";

export async function InstructorsRoute() {
  const queryClient = getQueryClient();
  const [viewer] = await Promise.all([
    getCurrentAuthorizationProfile(),
    queryClient.prefetchQuery({
      queryKey: INSTRUCTORS_QUERY_KEYS.approved(1, 10, ""),
      queryFn: () => getApprovedInstructorsPage(1, 10, ""),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InstructorsPage
        restrictPeerCredentials={viewer?.role === ROLE.INSTRUCTOR}
        viewerId={viewer?.id ?? null}
      />
    </HydrationBoundary>
  );
}
