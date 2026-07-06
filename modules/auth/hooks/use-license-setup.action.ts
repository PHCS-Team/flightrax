"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateLicenseSetupAction } from "@/modules/auth/actions/update-license-setup";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useLicenseSetup({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateLicenseSetupAction, {
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
