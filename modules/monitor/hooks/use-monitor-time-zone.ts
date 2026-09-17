"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  MONITOR_TIME_ZONE_META,
  MONITOR_TIME_ZONE_STORAGE_KEY,
  type MonitorTimeZone,
} from "@/modules/monitor/utils/time-zone";

function readStoredZone(): MonitorTimeZone {
  try {
    return window.localStorage.getItem(MONITOR_TIME_ZONE_STORAGE_KEY) === "zulu"
      ? "zulu"
      : "local";
  } catch {
    return "local";
  }
}

// The TV opens in Philippine time; Tab toggles to zulu and back. The
// choice survives a reload so a screen set up once stays that way.
export function useMonitorTimeZone(): MonitorTimeZone {
  const [zone, setZone] = useState<MonitorTimeZone>("local");
  const zoneRef = useRef(zone);

  useEffect(() => {
    zoneRef.current = zone;
  }, [zone]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the stored zone once after hydration; the server render must stay in Philippine time.
    setZone(readStoredZone());
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      event.preventDefault();

      // Side effects stay out of the state updater: React runs updaters
      // twice in development, which showed the toast twice.
      const next: MonitorTimeZone = zoneRef.current === "zulu" ? "local" : "zulu";

      try {
        window.localStorage.setItem(MONITOR_TIME_ZONE_STORAGE_KEY, next);
      } catch {
        // Storage can be unavailable; the toggle still works for the session.
      }

      toast(MONITOR_TIME_ZONE_META[next].toast, {
        duration: 3000,
        position: "top-center",
      });

      setZone(next);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return zone;
}
