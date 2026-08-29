"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { addInstructorUnavailabilityAction } from "@/modules/instructors/actions/add-instructor-unavailability";
import { INSTRUCTORS_QUERY_KEYS } from "@/modules/instructors/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useAddInstructorUnavailability({
  onAdded,
}: { onAdded?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(addInstructorUnavailabilityAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: INSTRUCTORS_QUERY_KEYS.all,
        });
        onAdded?.();
      }
    },
  });
}
