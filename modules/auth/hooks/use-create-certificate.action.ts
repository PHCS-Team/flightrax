"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { createCertificateAction } from "@/modules/auth/actions/create-certificate";
import { CERTIFICATE_QUERY_KEYS } from "@/modules/auth/queries/certificates";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useCreateCertificate({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(createCertificateAction, {
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
