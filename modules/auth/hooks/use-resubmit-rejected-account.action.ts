"use client";

import { useAction } from "next-safe-action/hooks";

import { resubmitRejectedAccountAction } from "@/modules/auth/actions/resubmit-rejected-account";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useResubmitRejectedAccount({
  onResubmitted,
}: {
  onResubmitted?: () => void;
} = {}) {
  return useAction(resubmitRejectedAccountAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onResubmitted?.();
      }
    },
  });
}
