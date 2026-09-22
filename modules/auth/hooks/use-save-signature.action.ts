"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { saveSignatureAction } from "@/modules/auth/actions/save-signature";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useSaveSignature({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(saveSignatureAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
        });
        onSaved?.();
      }
    },
  });
}
