"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { rejectFlightRequestAction } from "@/modules/flight-documents/actions/reject-flight-request";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useRejectFlightRequest({
  onRejected,
}: { onRejected?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(rejectFlightRequestAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
      });

      if (data?.ok) {
        onRejected?.();
      }
    },
  });
}
