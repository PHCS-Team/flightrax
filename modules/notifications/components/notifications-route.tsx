import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { NotificationsPage } from "@/modules/notifications/components/notifications-page";
import { NOTIFICATIONS_PAGE_SIZE } from "@/modules/notifications/queries/notifications";
import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import { getNotificationsPage } from "@/modules/notifications/services/notifications.server";
import { getQueryClient } from "@/shared/lib/query-client";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function NotificationsRoute() {
  const queryClient = getQueryClient();
  const viewer = await getCurrentAuthorizationProfile();

  if (viewer && isApproved(viewer)) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: NOTIFICATIONS_QUERY_KEYS.list(NOTIFICATIONS_PAGE_SIZE),
      queryFn: () =>
        getNotificationsPage(viewer.id, 1, NOTIFICATIONS_PAGE_SIZE),
      initialPageParam: 1,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsPage />
    </HydrationBoundary>
  );
}
