"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import {
  removeProfilePhotoAction,
  uploadProfilePhotoAction,
} from "@/modules/auth/actions/upload-profile-photo";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile-query";
import { toastActionResult } from "@/shared/lib/action-toast";

export function useProfilePhoto({
  onRemoved,
  onUploaded,
}: {
  onRemoved: () => void;
  onUploaded: () => void;
}) {
  const queryClient = useQueryClient();

  const upload = useAction(uploadProfilePhotoAction, {
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

  const remove = useAction(removeProfilePhotoAction, {
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
