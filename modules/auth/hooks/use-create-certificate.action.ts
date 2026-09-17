"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { createCertificateAction } from "@/modules/auth/actions/create-certificate";
import { CERTIFICATE_QUERY_KEYS } from "@/modules/auth/queries/certificates";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useCreateCertificate({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useGuardedAction(createCertificateAction, {
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
