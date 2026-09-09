"use client";

import { useCallback, useSyncExternalStore } from "react";

// Chromium fires this so a site can defer Chrome's own install affordance and
// present its own. It is not in lib.dom, hence the local shape.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Captured at module scope, not in an effect: beforeinstallprompt can fire
// before React mounts, and the event is single-use — miss it and there is no
// way to ask for it again.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

function emitPrompt() {
  for (const listener of promptListeners) {
    listener();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emitPrompt();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emitPrompt();
  });
}

function subscribePrompt(listener: () => void) {
  promptListeners.add(listener);

  return () => {
    promptListeners.delete(listener);
  };
}

// display-mode and the user agent never change for the life of the document,
// so these need no subscription — only a server snapshot, which keeps the
// first client render identical to the SSR output.
const noopSubscribe = () => () => {};
const serverSnapshot = () => false;

function getIsStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  // iOS Safari never implemented display-mode; it exposes this instead.
  const legacy = navigator as Navigator & { standalone?: boolean };

  return legacy.standalone === true;
}

function getIsIos(): boolean {
  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }

  // iPadOS 13+ reports a desktop Mac user agent, so /iPad/ alone misses every
  // iPad. iPadOS 16.4 supports installed web apps and push exactly as iPhone
  // does, so they must not be excluded.
  return ua.includes("Mac") && navigator.maxTouchPoints > 1;
}

export function useInstallApp() {
  const hasPrompt = useSyncExternalStore(
    subscribePrompt,
    () => deferredPrompt !== null,
    serverSnapshot,
  );
  const isStandalone = useSyncExternalStore(
    noopSubscribe,
    getIsStandalone,
    serverSnapshot,
  );
  const isIos = useSyncExternalStore(noopSubscribe, getIsIos, serverSnapshot);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    // Single-use: Chrome will not hand back the same event twice.
    deferredPrompt = null;
    emitPrompt();
  }, []);

  return {
    // Whether a native install dialog can be opened right now. When false we
    // still offer instructions rather than hiding: beforeinstallprompt is
    // unreliable (it does not fire once installed, needs engagement first,
    // and never fires outside Chromium), so hiding on its absence leaves
    // Android users with nothing.
    canPromptDirectly: hasPrompt,
    install,
    isIos,
    // Running from the home screen already means there is nothing to offer.
    isStandalone,
  };
}
