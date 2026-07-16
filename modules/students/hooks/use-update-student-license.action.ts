"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateStudentLicenseAction } from "@/modules/students/actions/update-student-license";
import { STUDENTS_QUERY_KEYS } from "@/modules/students/queries/query-keys";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateStudentLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateStudentLicenseAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: STUDENTS_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
