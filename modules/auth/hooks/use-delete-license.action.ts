"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteLicenseAction } from "@/modules/auth/actions/delete-license";
import { LICENSE_QUERY_KEYS } from "@/modules/auth/queries/licenses";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteLicense({ onSaved }: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteLicenseAction, {
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
