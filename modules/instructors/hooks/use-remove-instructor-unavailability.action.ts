"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { removeInstructorUnavailabilityAction } from "@/modules/instructors/actions/remove-instructor-unavailability";
import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useRemoveInstructorUnavailability() {
  const queryClient = useQueryClient();

  return useAction(removeInstructorUnavailabilityAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: INSTRUCTORS_QUERY_KEYS.all,
        });
      }
    },
  });
}
