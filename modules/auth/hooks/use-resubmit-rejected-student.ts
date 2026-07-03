"use client";

import { useAction } from "next-safe-action/hooks";

import { resubmitRejectedStudentAction } from "@/modules/auth/actions/resubmit-rejected-student";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useResubmitRejectedStudent({
  onResubmitted,
}: {
  onResubmitted?: () => void;
} = {}) {
  return useAction(resubmitRejectedStudentAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onResubmitted?.();
      }
    },
  });
}
