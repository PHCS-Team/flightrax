"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { terminateFlightAction } from "@/modules/dashboard/actions/terminate-flight";
import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useTerminateFlight({ onDone }: { onDone?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(terminateFlightAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });

      if (data?.ok) {
        onDone?.();
      }
    },
  });
}
