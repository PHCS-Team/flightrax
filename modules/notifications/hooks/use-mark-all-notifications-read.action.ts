"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { markAllNotificationsReadAction } from "@/modules/notifications/actions/mark-all-notifications-read";
import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useGuardedAction(markAllNotificationsReadAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}
