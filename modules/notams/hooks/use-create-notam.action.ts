"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { createNotamAction } from "@/modules/notams/actions/create-notam";
import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useCreateNotam({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(createNotamAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: NOTAMS_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
