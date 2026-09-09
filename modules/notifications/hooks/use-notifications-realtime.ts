"use client";

import { useQueryClient } from "@tanstack/react-query";

import { NOTIFICATIONS_QUERY_KEYS } from "@/modules/notifications/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

export function useNotificationsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "notifications-changes",
    enabled: Boolean(userId),
    filter: userId ? `user_id=eq.${userId}` : undefined,
    tables: ["notifications"],
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}
