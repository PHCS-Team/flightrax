"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { submitFlightRequestAction } from "@/modules/flight-documents/actions/submit-flight-request";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useSubmitFlightRequest({
  onSubmitted,
}: { onSubmitted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(submitFlightRequestAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
        });
        onSubmitted?.();
      }
    },
  });
}
