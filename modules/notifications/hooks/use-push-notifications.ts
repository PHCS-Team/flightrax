"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { deletePushSubscriptionAction } from "@/modules/notifications/actions/delete-push-subscription";
import { savePushSubscriptionAction } from "@/modules/notifications/actions/save-push-subscription";
import {
  toSubscriptionPayload,
  vapidKeyToBytes,
} from "@/modules/notifications/utils/push-subscription";
import { toastActionResult } from "@/shared/lib/action-toast";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const ASKED_KEY = "flightrax:push-asked";

export type PushPlatform = "ios" | "android" | "desktop";

export type PushStatus =
  | "unsupported"
  | "needs-install"
  | "denied"
  | "enabled"
  | "disabled";

function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function isIosDevice(): boolean {
  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }

  return ua.includes("Mac") && navigator.maxTouchPoints > 1;
}

function getPlatform(): PushPlatform {
  if (isIosDevice()) {
    return "ios";
  }

  return /Android/i.test(navigator.userAgent) ? "android" : "desktop";
}

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  const legacy = navigator as Navigator & { standalone?: boolean };

  return legacy.standalone === true;
}

type PushEnvironment = "unsupported" | "needs-install" | "denied" | "ready";

const noopSubscribe = () => () => {};
const serverEnvironment = (): PushEnvironment => "unsupported";

function getEnvironment(): PushEnvironment {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    return "unsupported";
  }

  if (isIosDevice() && !isStandalone()) {
    return "needs-install";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return "ready";
}

export function usePushNotifications() {
  const environment = useSyncExternalStore(
    noopSubscribe,
    getEnvironment,
    serverEnvironment,
  );
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasAsked, setHasAsked] = useState(true);

  useEffect(() => {
    if (environment !== "ready") {
      return;
    }

    let cancelled = false;

    void (async () => {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (cancelled) {
        return;
      }

      setHasSubscription(existing !== null);

      // Re-register an existing subscription on every launch. The browser
      // keeps handing back a subscription object after the app is
      // reinstalled, so the UI reads as "enabled" while the server has no
      // row for it — the user then receives nothing until they toggle off
      // and on. Upserting on endpoint makes that self-healing and costs one
      // write per launch.
      if (existing) {
        const payload = toSubscriptionPayload(existing);

        if (payload) {
          void savePushSubscriptionAction(payload);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [environment]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      try {
        setHasAsked(window.localStorage.getItem(ASKED_KEY) === "1");
      } catch {
        setHasAsked(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const markAsked = useCallback(() => {
    setHasAsked(true);

    try {
      window.localStorage.setItem(ASKED_KEY, "1");
    } catch {}
  }, []);

  const enable = useCallback(async () => {
    setIsBusy(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setHasSubscription(false);

        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyToBytes(VAPID_PUBLIC_KEY),
      });

      const payload = toSubscriptionPayload(subscription);

      if (!payload) {
        setHasSubscription(false);

        return;
      }

      const result = await savePushSubscriptionAction(payload);
      toastActionResult(result?.data);

      setHasSubscription(result?.data?.ok === true);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setIsBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setHasSubscription(false);

        return;
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const result = await deletePushSubscriptionAction({ endpoint });
      toastActionResult(result?.data);

      setHasSubscription(false);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const status: PushStatus | null =
    environment !== "ready"
      ? environment
      : hasSubscription === null
        ? null
        : hasSubscription
          ? "enabled"
          : "disabled";

  return {
    disable,
    enable,
    hasAsked,
    isBusy,
    markAsked,
    platform: useSyncExternalStore(
      noopSubscribe,
      getPlatform,
      (): PushPlatform => "desktop",
    ),
    status,
  };
}
