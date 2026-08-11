"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { deleteCertificateAction } from "@/modules/auth/actions/delete-certificate";
import { CERTIFICATE_QUERY_KEYS } from "@/modules/auth/queries/certificates";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useDeleteCertificate({
  onSaved,
}: { onSaved?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useAction(deleteCertificateAction, {
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
