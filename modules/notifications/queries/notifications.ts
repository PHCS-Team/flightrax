import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import {
  fetchNotificationsPage,
  fetchUnreadNotificationCount,
} from "@/modules/notifications/services/notifications.client";

export const NOTIFICATIONS_PAGE_SIZE = 15;

export function notificationsInfiniteQueryOptions(pageSize: number) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) => fetchNotificationsPage(pageParam, pageSize),
    queryKey: NOTIFICATIONS_QUERY_KEYS.list(pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}

export function unreadNotificationCountQueryOptions() {
  return queryOptions({
    queryFn: fetchUnreadNotificationCount,
    queryKey: NOTIFICATIONS_QUERY_KEYS.unreadCount,
    staleTime: 60 * 1000,
  });
}
