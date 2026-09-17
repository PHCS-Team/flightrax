"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { removeInstructorUnavailabilityAction } from "@/modules/instructors/actions/remove-instructor-unavailability";
import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useRemoveInstructorUnavailability() {
  const queryClient = useQueryClient();

  return useGuardedAction(removeInstructorUnavailabilityAction, {
    onError: ({ error }) => toastActionError(error),
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
