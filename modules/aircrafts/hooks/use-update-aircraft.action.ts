"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateAircraftAction } from "@/modules/aircrafts/actions/update-aircraft";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import type { AircraftEditSnapshot } from "@/modules/aircrafts/types/aircraft";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateAircraft({
  onConflict,
  onDeleted,
  onSaved,
}: {
  onConflict?: (latest: AircraftEditSnapshot) => void;
  onDeleted?: () => void;
  onSaved?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateAircraftAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      if (data?.ok === false && data.reason === "changed") {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onConflict?.(data.latest);
        return;
      }

      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onSaved?.();
      }

      if (data?.ok === false && data.reason === "deleted") {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onDeleted?.();
      }
    },
  });
}
