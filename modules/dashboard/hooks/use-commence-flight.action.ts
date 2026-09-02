"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { commenceFlightAction } from "@/modules/dashboard/actions/commence-flight";
import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import type { EarlierScheduledFlight } from "@/modules/dashboard/types/todays-flight";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCommenceFlight({
  onBlockedByEarlier,
  onDone,
}: {
  onBlockedByEarlier?: (earlierFlight: EarlierScheduledFlight) => void;
  onDone?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  return useAction(commenceFlightAction, {
    onSuccess: ({ data }) => {
      if (data && "code" in data && data.code === "EARLIER_SCHEDULED") {
        onBlockedByEarlier?.(data.earlierFlight);

        return;
      }

      toastActionResult(data);

      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });

      if (data?.ok) {
        onDone?.();
      }
    },
  });
}
