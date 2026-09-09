"use client";

import { useState } from "react";

import { BellIcon, BellOffIcon } from "lucide-react";

import { NotificationPermissionDialog } from "@/modules/notifications/components/notification-permission-dialog";

import { usePushNotifications } from "@/modules/notifications/hooks/use-push-notifications";
import { Button } from "@/shared/components/ui/button";

const BUTTON_CLASS =
  "mt-2 w-full cursor-pointer justify-start gap-2 border border-primary-foreground/20 bg-primary-foreground/10 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground disabled:cursor-default";

const NOTE_CLASS = "mt-2 text-[11px] leading-4 text-primary-foreground/60";

export function EnableNotificationsAction() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { disable, enable, isBusy, platform, status } = usePushNotifications();

  if (status === null || status === "unsupported") {
    return null;
  }

  if (status === "needs-install") {
    return (
      <p className={NOTE_CLASS}>
        Install the app first to receive notifications on this device.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <>
        <Button
          className={BUTTON_CLASS}
          onClick={() => setGuideOpen(true)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <BellOffIcon className="size-3.5" />
          Notifications blocked
        </Button>

        <NotificationPermissionDialog
          isBusy={false}
          mode="blocked"
          onDismiss={() => setGuideOpen(false)}
          onEnable={() => setGuideOpen(false)}
          onOpenChange={setGuideOpen}
          open={guideOpen}
          platform={platform}
        />
      </>
    );
  }

  if (status === "enabled") {
    return (
      <Button
        className={BUTTON_CLASS}
        disabled={isBusy}
        onClick={() => void disable()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <BellOffIcon className="size-3.5" />
        Turn off notifications
      </Button>
    );
  }

  return (
    <Button
      className={BUTTON_CLASS}
      disabled={isBusy}
      onClick={() => void enable()}
      size="sm"
      type="button"
      variant="ghost"
    >
      <BellIcon className="size-3.5" />
      Enable notifications
    </Button>
  );
}
