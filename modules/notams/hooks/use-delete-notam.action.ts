"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteNotamAction } from "@/modules/notams/actions/delete-notam";
import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteNotam({ onDeleted }: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteNotamAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: NOTAMS_QUERY_KEYS.all,
        });
        onDeleted?.();
      }
    },
  });
}