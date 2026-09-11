"use client";

import { BellIcon, BellRingIcon } from "lucide-react";

import { NotificationPermissionGate } from "@/modules/notifications/components/notification-permission-gate";
import { usePushNotifications } from "@/modules/notifications/hooks/use-push-notifications";
import { Button } from "@/shared/components/ui/button";

export function NotificationOptInCard() {
  const { enable, isBusy, status } = usePushNotifications();

  if (status === null || status === "unsupported") {
    return null;
  }

  if (status === "enabled") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4">
        <BellRingIcon className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
        <p className="text-sm leading-6 text-primary-foreground/80">
          You will be notified on this device as soon as your account is
          reviewed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4">
        <div className="flex items-start gap-3">
          <BellIcon className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Get notified when reviewed</p>
            <p className="mt-1 text-sm leading-6 text-primary-foreground/70">
              {status === "needs-install"
                ? "Install FlightraX to your home screen first — iPhone and iPad only deliver notifications to installed apps."
                : status === "denied"
                  ? "Notifications are blocked for this site. Allow them in your browser settings, then reload this page."
                  : "Turn on notifications and your device will alert you the moment your account is approved or rejected — no need to keep checking back."}
            </p>
          </div>
        </div>

        {status === "disabled" && (
          <Button
            className="mt-4 w-full"
            disabled={isBusy}
            onClick={() => void enable()}
            type="button"
            variant="outline"
          >
            Enable notifications
          </Button>
        )}
      </div>

      <NotificationPermissionGate />
    </>
  );
}
