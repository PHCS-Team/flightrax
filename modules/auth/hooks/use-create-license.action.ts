"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { createLicenseAction } from "@/modules/auth/actions/create-license";
import { LICENSE_QUERY_KEYS } from "@/modules/auth/queries/licenses";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCreateLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(createLicenseAction, {
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
