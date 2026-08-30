"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { terminateFlightAction } from "@/modules/dashboard/actions/terminate-flight";
import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useTerminateFlight({ onDone }: { onDone?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(terminateFlightAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });

      if (data?.ok) {
        onDone?.();
      }
    },
  });
}
