"use client";

import { useQuery } from "@tanstack/react-query";

import { unreadNotificationCountQueryOptions } from "@/modules/notifications/queries/notifications";

export function useUnreadNotificationCount() {
  const query = useQuery(unreadNotificationCountQueryOptions());

  return {
    unreadCount: query.data ?? 0,
    error: query.error,
    isPending: query.isPending,
  };
}
