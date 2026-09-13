"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { pingScheduleReadyAction } from "@/modules/schedule/actions/ping-schedule-ready";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function usePingScheduleReady({ onSent }: { onSent?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(pingScheduleReadyAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: SCHEDULE_QUERY_KEYS.days,
        });
        onSent?.();
      }
    },
  });
}
