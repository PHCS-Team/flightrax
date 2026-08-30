"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { cancelFlightAction } from "@/modules/dashboard/actions/cancel-flight";
import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCancelFlight({ onDone }: { onDone?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(cancelFlightAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });

      if (data?.ok) {
        onDone?.();
      }
    },
  });
}
