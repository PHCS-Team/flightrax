"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteFlightPlanAction } from "@/modules/flight-documents/actions/delete-flight-plan";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteFlightPlan({
  onDeleted,
}: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteFlightPlanAction, {
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
