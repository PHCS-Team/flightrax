"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { saveWeightBalanceAction } from "@/modules/flight-documents/actions/save-weight-balance";
import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useSaveWeightBalance({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(saveWeightBalanceAction, {
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
