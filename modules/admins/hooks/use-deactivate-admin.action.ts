"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { deactivateAdminAction } from "@/modules/admins/actions/deactivate-admin";
import { ADMINS_QUERY_KEYS } from "@/modules/admins/queries/query-keys";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useDeactivateAdmin({
  onDeactivated,
}: {
  onDeactivated: () => void;
}) {
  const queryClient = useQueryClient();

  return useGuardedAction(deactivateAdminAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        void queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEYS.all });
        onDeactivated();
      }
    },
  });
}
