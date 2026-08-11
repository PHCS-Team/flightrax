"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { updateCertificateAction } from "@/modules/auth/actions/update-certificate";
import { CERTIFICATE_QUERY_KEYS } from "@/modules/auth/queries/certificates";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useUpdateCertificate({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(updateCertificateAction, {
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
