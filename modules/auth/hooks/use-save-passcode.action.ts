"use client";

import { useGuardedAction } from "@/shared/hooks/use-guarded-action";
import { useQueryClient } from "@tanstack/react-query";

import { savePasscodeAction } from "@/modules/auth/actions/save-passcode";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useSavePasscode() {
  const queryClient = useQueryClient();

  return useGuardedAction(savePasscodeAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
      });
      toastActionResult(data);
    },
  });
}
