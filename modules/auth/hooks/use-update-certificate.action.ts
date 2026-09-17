"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { updateCertificateAction } from "@/modules/auth/actions/update-certificate";
import { CERTIFICATE_QUERY_KEYS } from "@/modules/auth/queries/certificates";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateCertificate({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(updateCertificateAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        queryClient.invalidateQueries({
          queryKey: CERTIFICATE_QUERY_KEYS.all,
        });
        onSaved?.();
      }
    },
  });
}
