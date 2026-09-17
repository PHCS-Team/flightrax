"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { createLicenseAction } from "@/modules/auth/actions/create-license";
import { LICENSE_QUERY_KEYS } from "@/modules/auth/queries/licenses";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useCreateLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(createLicenseAction, {
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
