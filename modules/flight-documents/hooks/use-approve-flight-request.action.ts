"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useOneShotAction } from "@/shared/hooks/use-guarded-action";

import { approveFlightRequestAction } from "@/modules/flight-documents/actions/approve-flight-request";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useApproveFlightRequest({
  onApproved,
}: { onApproved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useOneShotAction(approveFlightRequestAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.all,
      });

      if (data?.ok) {
        onApproved?.();
      }
    },
  });
}
