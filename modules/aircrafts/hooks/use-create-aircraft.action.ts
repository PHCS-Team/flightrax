"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { createAircraftAction } from "@/modules/aircrafts/actions/create-aircraft";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCreateAircraft({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(createAircraftAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        onSaved?.();
      }
    },
  });
}
