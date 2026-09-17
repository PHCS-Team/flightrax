"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { deleteAircraftAction } from "@/modules/aircrafts/actions/delete-aircraft";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteAircraft({
  onDeleted,
}: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(deleteAircraftAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onDeleted?.();
      }
    },
  });
}
