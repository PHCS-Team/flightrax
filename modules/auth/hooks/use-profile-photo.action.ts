"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import {
  removeProfilePhotoAction,
  uploadProfilePhotoAction,
} from "@/modules/auth/actions/upload-profile-photo";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";

export function useProfilePhoto({
  onRemoved,
  onUploaded,
}: {
  onRemoved: () => void;
  onUploaded: () => void;
}) {
  const queryClient = useQueryClient();

  const upload = useGuardedAction(uploadProfilePhotoAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onUploaded();
        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
        });
      }
    },
  });

  const remove = useGuardedAction(removeProfilePhotoAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        onRemoved();
        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
        });
      }
    },
  });

  return { remove, upload };
}
