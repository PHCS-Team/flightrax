"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { uploadScheduleFileAction } from "@/modules/schedule/actions/upload-schedule-file";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUploadScheduleFile({
  onUploaded,
}: { onUploaded?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(uploadScheduleFileAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: SCHEDULE_QUERY_KEYS.uploads,
        });
        onUploaded?.();
      }
    },
  });
}
