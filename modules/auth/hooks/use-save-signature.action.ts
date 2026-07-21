"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { saveSignatureAction } from "@/modules/auth/actions/save-signature";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useSaveSignature() {
  const queryClient = useQueryClient();

  return useAction(saveSignatureAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
        });
      }
    },
  });
}
