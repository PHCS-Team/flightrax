"use client";

import { useState } from "react";

import { BellIcon, BellOffIcon } from "lucide-react";

import { NotificationPermissionDialog } from "@/modules/notifications/components/notification-permission-dialog";

import { usePushNotifications } from "@/modules/notifications/hooks/use-push-notifications";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";

const DESCRIPTION: Record<string, string> = {
  denied:
    "Notifications are blocked for this site. Allow them in your browser settings, then reload this page.",
  disabled:
    "Get alerts on this device when a flight request needs your review, a NOTAM is posted, or your account is updated.",
  enabled: "This device receives notifications even when FlightraX is closed.",
  "needs-install":
    "Install FlightraX to your home screen first — iPhone and iPad only deliver notifications to installed apps.",
};

export function NotificationSettingsCard() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { disable, enable, isBusy, platform, status } = usePushNotifications();

  if (status === null || status === "unsupported") {
    return null;
  }

  const isEnabled = status === "enabled";
  const canAct = status === "enabled" || status === "disabled";

  return (
    <GlassSurface className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
          {isEnabled ? (
            <BellIcon className="size-5" />
          ) : (
            <BellOffIcon className="size-5" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
            Device Notifications
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/70">
            {DESCRIPTION[status]}
          </p>
        </div>
      </div>

      {status === "denied" && (
        <>
          <Button
            className="cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => setGuideOpen(true)}
            type="button"
            variant="outline"
          >
            <BellOffIcon className="size-4" />
            How to unblock
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
      )}

      {canAct && (
        <Button
          className="cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default"
          disabled={isBusy}
          onClick={() => void (isEnabled ? disable() : enable())}
          type="button"
          variant="outline"
        >
          {isEnabled ? (
            <BellOffIcon className="size-4" />
          ) : (
            <BellIcon className="size-4" />
          )}
          {isEnabled ? "Turn off notifications" : "Enable notifications"}
        </Button>
      )}
    </GlassSurface>
  );
}
