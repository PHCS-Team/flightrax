"use client";

import { useCallback, useSyncExternalStore } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;

  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function subscribeFullscreen(listener: () => void) {
  document.addEventListener("fullscreenchange", listener);
  document.addEventListener("webkitfullscreenchange", listener);

  return () => {
    document.removeEventListener("fullscreenchange", listener);
    document.removeEventListener("webkitfullscreenchange", listener);
  };
}

const noopSubscribe = () => () => {};
const serverSnapshot = () => false;

function getIsSupported(): boolean {
  const doc = document as FullscreenDocument;

  return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled);
}

export function useMonitorFullscreen() {
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    getIsSupported,
    serverSnapshot,
  );
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    () => getFullscreenElement() !== null,
    serverSnapshot,
  );

  const toggle = useCallback(async () => {
    const doc = document as FullscreenDocument;

    try {
      if (getFullscreenElement()) {
        await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());

        return;
      }

      const root = document.documentElement as FullscreenElement;
      await (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.());
    } catch {}
  }, []);

  return { isFullscreen, isSupported, toggle };
}
