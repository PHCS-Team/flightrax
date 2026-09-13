"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { markNotificationReadAction } from "@/modules/notifications/actions/mark-notification-read";
import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import { toastActionError } from "@/shared/lib/action-toast";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useAction(markNotificationReadAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}
