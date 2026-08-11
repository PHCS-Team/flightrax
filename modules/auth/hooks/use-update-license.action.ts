"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateLicenseAction } from "@/modules/auth/actions/update-license";
import { LICENSE_QUERY_KEYS } from "@/modules/auth/queries/licenses";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateLicenseAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: LICENSE_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
