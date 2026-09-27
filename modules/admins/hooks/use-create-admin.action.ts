"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { createAdminAccountAction } from "@/modules/admins/actions/create-admin";
import { ADMINS_QUERY_KEYS } from "@/modules/admins/queries/query-keys";
import type { AdminCredentials } from "@/modules/admins/types/admin";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useCreateAdmin({
  onCreated,
}: {
  onCreated: (credentials: AdminCredentials) => void;
}) {
  const queryClient = useQueryClient();

  return useGuardedAction(createAdminAccountAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok && data.credentials) {
        void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEYS.all });
        onCreated(data.credentials);
      }
    },
  });
}
