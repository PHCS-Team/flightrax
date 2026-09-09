"use client";

import { BellIcon, BellOffIcon } from "lucide-react";

import type { PushPlatform } from "@/modules/notifications/hooks/use-push-notifications";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const BLOCKED_STEPS: Record<PushPlatform, string[]> = {
  android: [
    "Open the browser menu, then Settings.",
    "Go to Site settings, then Notifications.",
    "Find FlightraX and switch it to Allow.",
  ],
  desktop: [
    "Click the icon on the left of the address bar.",
    "Find Notifications in the site permissions list.",
    "Switch it to Allow, then reload this page.",
  ],
  ios: [
    "Open the iPhone or iPad Settings app.",
    "Scroll to Notifications, then find FlightraX.",
    "Turn on Allow Notifications.",
  ],
};

export function NotificationPermissionDialog({
  isBusy,
  mode,
  onDismiss,
  onEnable,
  onOpenChange,
  open,
  platform,
}: {
  isBusy: boolean;
  mode: "ask" | "blocked";
  onDismiss: () => void;
  onEnable: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  platform: PushPlatform;
}) {
  const isBlocked = mode === "blocked";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              {isBlocked ? (
                <BellOffIcon className="size-4.5" />
              ) : (
                <BellIcon className="size-4.5" />
              )}
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                {isBlocked
                  ? "Notifications Are Blocked"
                  : "Turn On Notifications"}
              </DialogTitle>
              <DialogDescription className="leading-6 text-muted-foreground">
                {isBlocked
                  ? "Your browser is blocking notifications for FlightraX, so we cannot ask again from here."
                  : "Get alerted when a flight request needs your review, a NOTAM is posted, or your account is updated — even when FlightraX is closed."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isBlocked && (
          <ol className="mt-1 space-y-3">
            {BLOCKED_STEPS[platform].map((step, index) => (
              <li className="flex items-start gap-3" key={step}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        )}

        {isBlocked ? (
          <DialogFooter>
            <Button
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Got it
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button
              className="cursor-pointer"
              onClick={onDismiss}
              type="button"
              variant="outline"
            >
              Not now
            </Button>
            <Button
              className="cursor-pointer disabled:cursor-default"
              disabled={isBusy}
              onClick={onEnable}
              type="button"
            >
              Enable notifications
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
