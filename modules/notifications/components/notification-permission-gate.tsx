"use client";

import { useEffect, useRef, useState } from "react";

import { NotificationPermissionDialog } from "@/modules/notifications/components/notification-permission-dialog";
import { usePushNotifications } from "@/modules/notifications/hooks/use-push-notifications";

export function NotificationPermissionGate() {
  const { enable, hasAsked, isBusy, markAsked, platform, status } =
    usePushNotifications();
  const attemptedRef = useRef(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (status !== "disabled" || hasAsked || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;

    void enable()
      .then(() => {
        markAsked();
      })
      .catch(() => {
        markAsked();
        setNeedsGesture(true);
      });
  }, [enable, hasAsked, markAsked, status]);

  const onDismiss = () => {
    markAsked();
    setClosed(true);
  };

  const onEnable = async () => {
    markAsked();
    await enable();
    setClosed(true);
  };

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
      open={needsGesture && !closed && status === "disabled"}
      platform={platform}
    />
  );
}
