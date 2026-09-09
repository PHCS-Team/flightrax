"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { markAllNotificationsReadAction } from "@/modules/notifications/actions/mark-all-notifications-read";
import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useAction(markAllNotificationsReadAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}
