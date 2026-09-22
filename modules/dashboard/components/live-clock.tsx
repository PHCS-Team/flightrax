"use client";

import { useSyncExternalStore } from "react";

import { formatHeaderClock } from "@/modules/dashboard/utils/format";

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

export function LiveClock() {
  const seconds = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );

  if (!seconds) {
    return null;
  }

  const clock = formatHeaderClock(new Date(seconds * 1000));

  return (
    <p className="max-w-48 text-right text-xs font-medium tabular-nums text-primary-foreground/70 sm:max-w-none">
      <span className="whitespace-nowrap">{clock.philippine}</span>{" "}
      <span className="whitespace-nowrap">{clock.utc}</span>
    </p>
  );
}
