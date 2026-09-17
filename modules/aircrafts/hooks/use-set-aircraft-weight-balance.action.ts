"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { setAircraftWeightBalanceAction } from "@/modules/aircrafts/actions/set-aircraft-weight-balance";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useSetAircraftWeightBalance({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(setAircraftWeightBalanceAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: AIRCRAFTS_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
