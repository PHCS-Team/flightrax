"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useOneShotAction } from "@/shared/hooks/use-guarded-action";

import { deleteFlightPlanAction } from "@/modules/flight-documents/actions/delete-flight-plan";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteFlightPlan({
  onDeleted,
}: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useOneShotAction(deleteFlightPlanAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
      });

      if (data?.ok) {
        onDeleted?.();
      }
    },
  });
}
