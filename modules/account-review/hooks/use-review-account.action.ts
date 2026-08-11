"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { toastActionResult } from "@/shared/lib/action-toast";
import { ACCOUNT_REVIEW_QUERY_KEYS } from "@/modules/account-review/queries/query-keys";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import { STUDENTS_PARENT_QUERY_KEY } from "@/shared/lib/query-keys";
import {
  approveAccountRequestAction,
  rejectAccountRequestAction,
} from "@/modules/account-review/actions/review-account";
import type { AccountReviewItem } from "@/modules/account-review/types/account-review";

export function useReviewAccount({
  onStatusChange,
  requestType,
}: {
  onStatusChange: (status: ApprovalStatus) => void;
  requestType: AccountRequestRole;
}) {
  const queryClient = useQueryClient();
  const approve = useAction(approveAccountRequestAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onStatusChange(APPROVAL_STATUS.APPROVED);
        queryClient.setQueryData<AccountReviewItem[]>(
          ACCOUNT_REVIEW_QUERY_KEYS.list(requestType),
          (requests) =>
            requests?.filter((request) => request.id !== data.requestId),
        );
        queryClient.invalidateQueries({
          queryKey: ACCOUNT_REVIEW_QUERY_KEYS.metrics,
        });

        if (requestType === ROLE.STUDENT) {
          queryClient.invalidateQueries({
            queryKey: STUDENTS_PARENT_QUERY_KEY,
          });
        }
      }
    },
  });
  const reject = useAction(rejectAccountRequestAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onStatusChange(APPROVAL_STATUS.REJECTED);
        queryClient.setQueryData<AccountReviewItem[]>(
          ACCOUNT_REVIEW_QUERY_KEYS.list(requestType),
          (requests) =>
            requests?.map((request) =>
              request.id === data.requestId
                ? {
                    ...request,
                    approvalStatus: data.approvalStatus,
                    rejectionReason: data.rejectionReason,
                    rejectedAt: data.rejectedAt,
                  }
                : request,
            ),
        );
        queryClient.invalidateQueries({
          queryKey: ACCOUNT_REVIEW_QUERY_KEYS.metrics,
        });
      }
    },
  });

  return {
    approve,
    isExecuting: approve.isExecuting || reject.isExecuting,
    reject,
  };
}
