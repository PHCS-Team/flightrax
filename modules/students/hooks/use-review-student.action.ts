"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { toastActionResult } from "@/shared/lib/action-toast";
import {
  STUDENT_REVIEW_QUERY_KEYS,
  STUDENTS_QUERY_KEYS,
} from "@/modules/students/queries/query-keys";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import {
  approveStudentForReviewAction,
  rejectStudentForReviewAction,
} from "@/modules/students/actions/review-student";
import type { StudentReviewItem } from "@/modules/students/types/student-review";

export function useReviewStudent({
  onStatusChange,
}: {
  onStatusChange: (status: ApprovalStatus) => void;
}) {
  const queryClient = useQueryClient();
  const approve = useAction(approveStudentForReviewAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onStatusChange(APPROVAL_STATUS.APPROVED);
        queryClient.setQueryData<StudentReviewItem[]>(
          STUDENT_REVIEW_QUERY_KEYS.list,
          (students) =>
            students?.filter((student) => student.id !== data.studentId),
        );
        queryClient.invalidateQueries({
          queryKey: STUDENTS_QUERY_KEYS.all,
        });
      }
    },
  });
  const reject = useAction(rejectStudentForReviewAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onStatusChange(APPROVAL_STATUS.REJECTED);
        queryClient.setQueryData<StudentReviewItem[]>(
          STUDENT_REVIEW_QUERY_KEYS.list,
          (students) =>
            students?.map((student) =>
              student.id === data.studentId
                ? {
                    ...student,
                    approvalStatus: data.approvalStatus,
                    rejectionReason: data.rejectionReason,
                    rejectedAt: data.rejectedAt,
                  }
                : student,
            ),
        );
      }
    },
  });

  return {
    approve,
    isExecuting: approve.isExecuting || reject.isExecuting,
    reject,
  };
}
