import { formatZuluHm } from "@/shared/lib/aviation/flight-board";
import { OPERATIONS_TIME_ZONE } from "@/shared/lib/aviation/operations-time-zone";

// The TV shows every clock in one zone at a time: zulu (the flight plan
// convention) or Philippine time, toggled with the Tab key.
export type MonitorTimeZone = "zulu" | "local";

export const MONITOR_TIME_ZONE_STORAGE_KEY = "flightrax-monitor-time-zone";

export const MONITOR_TIME_ZONE_META: Record<
  MonitorTimeZone,
  { indicator: string; toast: string }
> = {
  zulu: {
    indicator: "UTC",
    toast: "Times shown in zulu (UTC)",
  },
  local: {
    indicator: "PHT",
    toast: "Times shown in Philippine time (UTC+8)",
  },
};

export function formatMonitorTime(iso: string, zone: MonitorTimeZone): string {
  if (zone === "zulu") {
    return formatZuluHm(iso);
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: OPERATIONS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatMonitorDate(iso: string, zone: MonitorTimeZone): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone === "zulu" ? "UTC" : OPERATIONS_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
