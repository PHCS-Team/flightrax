"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateFlightPlanAction } from "@/modules/flight-documents/actions/update-flight-plan";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateFlightPlan({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateFlightPlanAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
      });

      if (data?.ok) {
        onSaved?.();
      }
    },
  });
}
