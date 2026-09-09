"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import {
  NOTIFICATIONS_PAGE_SIZE,
  notificationsInfiniteQueryOptions,
} from "@/modules/notifications/queries/notifications";

export function useNotifications(pageSize: number = NOTIFICATIONS_PAGE_SIZE) {
  const query = useInfiniteQuery(notificationsInfiniteQueryOptions(pageSize));
  const pages = query.data?.pages ?? [];

  return {
    notifications: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount ?? 0,
    error: query.error,
    isPending: query.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
