"use client";

import { useCallback, useSyncExternalStore } from "react";

const EXPAND_HINT_STORAGE_KEY = "flightrax.dashboard.expand-hint-dismissed";
const EXPAND_HINT_CHANGE_EVENT = "flightrax:expand-hint-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EXPAND_HINT_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EXPAND_HINT_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): boolean {
  try {
    return (
      window.localStorage.getItem(EXPAND_HINT_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

// Render as dismissed on the server so users who already closed the
// hint never see it flash back in during hydration.
function getServerSnapshot(): boolean {
  return true;
}

// One-time "tap a row to expand" hint on the flight status board. Once
// dismissed it never shows again on this browser.
export function useExpandHint() {
  const isDismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(EXPAND_HINT_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable (e.g. private mode) — the dismissal simply
      // will not persist.
    }

    window.dispatchEvent(new Event(EXPAND_HINT_CHANGE_EVENT));
  }, []);

  return { isDismissed, dismiss };
}
