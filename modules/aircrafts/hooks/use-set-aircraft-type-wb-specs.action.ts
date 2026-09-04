"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { setAircraftTypeWbSpecsAction } from "@/modules/aircrafts/actions/set-aircraft-type-wb-specs";
import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";
import { RATING_OPTIONS_QUERY_KEY } from "@/shared/lib/query-keys";

export function useSetAircraftTypeWbSpecs({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(setAircraftTypeWbSpecsAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({ queryKey: AIRCRAFTS_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: RATING_OPTIONS_QUERY_KEY });
        onSaved?.();
      }
    },
  });
}
