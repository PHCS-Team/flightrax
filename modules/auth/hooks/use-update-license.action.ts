"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateLicenseAction } from "@/modules/auth/actions/update-license";
import { LICENSE_QUERY_KEYS } from "@/modules/auth/queries/licenses";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateLicenseAction, {
    onError: ({ error }) => toastActionError(error),
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
