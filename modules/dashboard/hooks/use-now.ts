"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30 * 1000;

function subscribe(callback: () => void) {
  const timer = setInterval(callback, TICK_MS);

  return () => clearInterval(timer);
}

function getSnapshot() {
  return Math.floor(Date.now() / TICK_MS);
}

function getServerSnapshot() {
  return 0;
}

export function useNowMs(): number {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return tick * TICK_MS;
}
