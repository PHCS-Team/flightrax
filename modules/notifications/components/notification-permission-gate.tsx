"use client";

import { useState } from "react";

import { NotificationPermissionDialog } from "@/modules/notifications/components/notification-permission-dialog";
import { usePushNotifications } from "@/modules/notifications/hooks/use-push-notifications";

export function NotificationPermissionGate() {
  const { enable, hasAsked, isBusy, markAsked, platform, status } =
    usePushNotifications();
  const [closed, setClosed] = useState(false);

  const onDismiss = () => {
    markAsked();
    setClosed(true);
  };

  const onEnable = async () => {
    markAsked();
    await enable();
    setClosed(true);
  };

  // The browser's own permission prompt is deliberately not fired on launch.
  // Granting it only records a permission — it does not subscribe the device
  // or store anything, so a user who accepted it still received nothing and
  // had no idea why. The permission is now requested from this dialog's
  // button, where accepting runs the whole flow: permission, subscribe, save.
  return (
    <NotificationPermissionDialog
      isBusy={isBusy}
      mode="ask"
      onDismiss={onDismiss}
      onEnable={() => void onEnable()}
      onOpenChange={(next) => {
        if (!next) {
          onDismiss();
        }
      }}
      open={status === "disabled" && !hasAsked && !closed}
      platform={platform}
    />
  );
}
