"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateScheduleEntryAction } from "@/modules/schedule/actions/update-schedule-entry";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateScheduleEntry({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateScheduleEntryAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: SCHEDULE_QUERY_KEYS.days,
        });
        onSaved?.();
      }
    },
  });
}
