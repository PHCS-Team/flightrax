import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { NotamsPage } from "@/modules/notams/components/notams-page";
import { NOTAMS_PAGE_SIZE } from "@/modules/notams/constants/notam-options";
import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { getNotamsPage } from "@/modules/notams/services/notams.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { SYSTEM_MANAGE } from "@/shared/lib/rbac/permissions";
import { getQueryClient } from "@/shared/lib/query-client";

export async function NotamsRoute() {
  const queryClient = getQueryClient();
  const [viewer] = await Promise.all([
    getCurrentAuthorizationProfile(),
    queryClient.prefetchInfiniteQuery({
      queryKey: NOTAMS_QUERY_KEYS.list(NOTAMS_PAGE_SIZE, "", "active", "all"),
      queryFn: () => getNotamsPage(1, NOTAMS_PAGE_SIZE, "", "active", "all"),
      initialPageParam: 1,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotamsPage
        canDeleteAny={
          viewer
            ? hasPermission(viewer.role, SYSTEM_MANAGE, viewer.admin_department)
            : false
        }
        viewerId={viewer?.id ?? null}
      />
    </HydrationBoundary>
  );
}
