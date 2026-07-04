"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateStudentLicenseAction } from "@/modules/students/actions/update-student-license";
import type { ApprovedStudent } from "@/modules/students/types/student";
import { toastActionResult } from "@/shared/lib/action-toast";
import { STUDENTS_QUERY_KEYS } from "@/shared/lib/query-keys";

export function useUpdateStudentLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateStudentLicenseAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.setQueryData<ApprovedStudent[]>(
          STUDENTS_QUERY_KEYS.approved,
          (students) =>
            students?.map((student) =>
              data.student && student.id === data.student.id
                ? {
                    ...student,
                    licenseType: data.student.licenseType,
                    licenseNumber: data.student.licenseNumber,
                    rating: data.student.rating,
                  }
                : student,
            ),
        );
        queryClient.invalidateQueries({
          queryKey: STUDENTS_QUERY_KEYS.approved,
        });
        onSaved?.();
      }
    },
  });
}
