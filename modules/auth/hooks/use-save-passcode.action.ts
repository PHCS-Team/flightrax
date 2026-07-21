"use client";

import { useAction } from "next-safe-action/hooks";
import { useQueryClient } from "@tanstack/react-query";

import { savePasscodeAction } from "@/modules/auth/actions/save-passcode";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useSavePasscode() {
  const queryClient = useQueryClient();

  return useAction(savePasscodeAction, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
      });
      toastActionResult(data);
    },
  });
}
