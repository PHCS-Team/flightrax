"use client";

import { useAction } from "next-safe-action/hooks";

import { resubmitRejectedAccountAction } from "@/modules/auth/actions/resubmit-rejected-account";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useResubmitRejectedAccount({
  onResubmitted,
}: {
  onResubmitted?: () => void;
} = {}) {
  return useAction(resubmitRejectedAccountAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onResubmitted?.();
      }
    },
  });
}
