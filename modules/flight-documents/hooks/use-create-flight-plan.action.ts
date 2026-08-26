"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { createFlightPlanAction } from "@/modules/flight-documents/actions/create-flight-plan";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCreateFlightPlan({
  onSaved,
}: { onSaved?: (flightPlanId?: string) => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(createFlightPlanAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
        });
        onSaved?.(
          "flightPlanId" in data ? data.flightPlanId : undefined,
        );
      }
    },
  });
}
