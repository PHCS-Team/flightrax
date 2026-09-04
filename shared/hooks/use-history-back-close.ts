"use client";

import { useEffect, useId, useRef } from "react";

const STATE_KEY = "flightraxOverlay";

function currentOverlayId(): string | null {
  const state: unknown = window.history.state;

  if (typeof state === "object" && state !== null && STATE_KEY in state) {
    const id = (state as Record<string, unknown>)[STATE_KEY];

    return typeof id === "string" ? id : null;
  }

  return null;
}

// Makes the browser/phone Back button close an open overlay instead of
// leaving the page. Every open overlay pushes one history entry tagged
// with its own id, so with a drawer and a dialog open, Back closes the
// dialog first, then the drawer, then finally navigates. Closing through
// the UI consumes the entry so Back never has a stale step to eat.
export function useHistoryBackClose(open: boolean, close: () => void) {
  const id = useId();
  const pushedRef = useRef(false);
  const closeRef = useRef(close);

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (open) {
      // Next.js patches pushState and keeps its own keys; spreading the
      // current state preserves them.
      window.history.pushState(
        { ...(window.history.state ?? {}), [STATE_KEY]: id },
        "",
      );
      pushedRef.current = true;

      const onPopState = () => {
        // Our entry is gone — Back was pressed while we were on top.
        if (currentOverlayId() !== id) {
          pushedRef.current = false;
          closeRef.current();
        }
      };

      window.addEventListener("popstate", onPopState);

      return () => window.removeEventListener("popstate", onPopState);
    }

    // Closed through the UI while our entry is still the top one.
    if (pushedRef.current && currentOverlayId() === id) {
      pushedRef.current = false;
      window.history.back();
    }

    return undefined;
  }, [id, open]);
}
