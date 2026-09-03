"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { createNotamAction } from "@/modules/notams/actions/create-notam";
import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCreateNotam({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(createNotamAction, {
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