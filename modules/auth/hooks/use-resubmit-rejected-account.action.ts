"use client";

import { useOneShotAction } from "@/shared/hooks/use-guarded-action";

import { resubmitRejectedAccountAction } from "@/modules/auth/actions/resubmit-rejected-account";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useResubmitRejectedAccount({
  onResubmitted,
}: {
  onResubmitted?: () => void;
} = {}) {
  return useOneShotAction(resubmitRejectedAccountAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onResubmitted?.();
      }
    },
  });
}
