"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateAircraftAction } from "@/modules/aircrafts/actions/update-aircraft";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateAircraft({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateAircraftAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onSaved?.();
      }
    },
  });
}
