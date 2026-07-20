"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteAircraftAction } from "@/modules/aircrafts/actions/delete-aircraft";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteAircraft({ onDeleted }: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteAircraftAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onDeleted?.();
      }
    },
  });
}
