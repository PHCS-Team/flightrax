"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteAircraftTypeAction } from "@/modules/aircrafts/actions/delete-aircraft-type";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteAircraftType({ onDeleted }: { onDeleted?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteAircraftTypeAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.types });
        onDeleted?.();
      }
    },
  });
}
