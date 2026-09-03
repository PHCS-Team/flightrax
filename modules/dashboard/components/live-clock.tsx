"use client";

import { format } from "date-fns";
import { useSyncExternalStore } from "react";

function subscribeToClock(callback: () => void) {
  const timer = setInterval(callback, 1000);

  return () => clearInterval(timer);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getClockServerSnapshot() {
  return 0;
}

// Live local date/time — useSyncExternalStore keeps it hydration-safe
// and self-contained, no library needed. Mobile shows time only; the
// full date joins on wider screens.
export function LiveClock() {
  const seconds = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );

  if (!seconds) {
    return null;
  }

  const now = new Date(seconds * 1000);

  return (
    <p className="whitespace-nowrap text-xs font-medium tabular-nums text-primary-foreground/70">
      <span>{format(now, "MMM d, yyyy · h:mm:ss a")}</span>
    </p>
  );
}
