"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateFlightPlanAction } from "@/modules/flight-documents/actions/update-flight-plan";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateFlightPlan({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateFlightPlanAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
