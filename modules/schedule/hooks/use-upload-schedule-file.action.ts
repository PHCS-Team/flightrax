"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { uploadScheduleFileAction } from "@/modules/schedule/actions/upload-schedule-file";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUploadScheduleFile({
  onUploaded,
}: { onUploaded?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(uploadScheduleFileAction, {
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
