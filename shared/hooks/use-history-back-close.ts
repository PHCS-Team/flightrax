"use client";

import { useEffect, useId, useRef } from "react";

const STATE_KEY = "flightraxOverlay";

type OverlayEntry = { id: string; close: () => void };

// One stack for every open overlay on the page, one history entry ("the
// marker") for the whole stack, and one popstate listener. Back closes
// the topmost overlay; the marker is re-pushed while overlays remain and
// consumed once the last one closes through the UI.
//
// Decisions are made in a microtask after React commits, never inside an
// effect, so "close A and open B in the same click" settles once with B
// on top instead of racing a history.back() against a pushState.
//
// CONTRACT for navigating away from an open overlay: do NOT close it —
// call router.replace(href) and let the route change unmount it. The
// replace overwrites the marker entry, so Back lands on the page beneath.
// Closing first triggers history.back(), which the App Router treats as a
// newer navigation and it discards the pending push — the user sees the
// overlay close and nothing else happen.
const openOverlays: OverlayEntry[] = [];
let listening = false;
let settleQueued = false;
let expectingOwnPop = false;

function hasMarker(): boolean {
  const state: unknown = window.history.state;

  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[STATE_KEY] === true
  );
}

function pushMarker() {
  // Next.js patches pushState and keeps its own keys; spreading the
  // current state preserves them.
  window.history.pushState(
    { ...(window.history.state ?? {}), [STATE_KEY]: true },
    "",
  );
}

function settle() {
  settleQueued = false;

  if (openOverlays.length > 0) {
    if (!hasMarker()) {
      pushMarker();
    }

    return;
  }

  if (hasMarker()) {
    expectingOwnPop = true;
    window.history.back();
  }
}

function queueSettle() {
  if (settleQueued) {
    return;
  }

  settleQueued = true;
  queueMicrotask(settle);
}

function onPopState() {
  // Landed on the marker itself (e.g. Forward) — nothing to close.
  if (hasMarker()) {
    return;
  }

  if (expectingOwnPop) {
    expectingOwnPop = false;

    // Our own consume finished; anything opened meanwhile needs a marker.
    if (openOverlays.length > 0) {
      queueSettle();
    }

    return;
  }

  const top = openOverlays.pop();

  if (!top) {
    return;
  }

  top.close();
  queueSettle();
}

function ensureListener() {
  if (listening) {
    return;
  }

  listening = true;
  window.addEventListener("popstate", onPopState);
}

function removeOverlay(id: string) {
  const index = openOverlays.findIndex((entry) => entry.id === id);

  if (index !== -1) {
    openOverlays.splice(index, 1);
  }
}

// Makes the browser/phone Back button close an open overlay instead of
// leaving the page. Used by the shared Dialog and Sheet; see the contract
// above before navigating from inside one.
export function useHistoryBackClose(open: boolean, close: () => void) {
  const id = useId();
  const closeRef = useRef(close);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (!open) {
      return;
    }

    ensureListener();
    openOverlays.push({ id, close: () => closeRef.current() });
    queueSettle();

    // Runs on unmount too — a route change must only drop the entry,
    // never call history.back() (that would cancel the navigation).
    return () => removeOverlay(id);
  }, [id, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;

      return;
    }

    // Closed through the UI while still mounted: consume the marker if
    // this was the last overlay.
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      queueSettle();
    }
  }, [open]);
}
