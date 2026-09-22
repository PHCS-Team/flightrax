"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ACCOUNT_REVIEW_QUERY_KEYS } from "@/modules/account-review/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

export function useAccountRequestsRealtime() {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "account-requests-changes",
    tables: ["account_requests"],
    onChange: () => {
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_REVIEW_QUERY_KEYS.listAll,
      });
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_REVIEW_QUERY_KEYS.metrics,
      });
    },
  });
}
