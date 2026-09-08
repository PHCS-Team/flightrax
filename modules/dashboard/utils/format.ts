import { format } from "date-fns";

// Display formatting for the flight status board.

// Filed zulu departure time (HHMM, e.g. "1130") → the viewer's local
// time in readable form, e.g. "7:30 PM". Resolved against the current
// zulu date, which is the board's flight date.
export function formatZuluTimeToLocal(hhmm: string): string {
  if (!/^\d{4}$/.test(hhmm)) {
    return hhmm;
  }

  const now = new Date();
  const date = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Number(hhmm.slice(0, 2)),
      Number(hhmm.slice(2, 4)),
    ),
  );

  return format(date, "h:mm a");
}

// Elapsed span between two ISO timestamps, e.g. "1h 24m".
export function formatDurationBetween(
  startIso: string | null,
  endIso: string | null,
): string | null {
  if (!startIso || !endIso) {
    return null;
  }

  const totalMinutes = Math.max(
    0,
    Math.floor(
      (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
    ),
  );

  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

// ISO timestamp → the viewer's local time of day, e.g. "3:45 PM".
export function formatTimeOfDay(iso: string): string {
  return format(new Date(iso), "h:mm a");
}

// Elapsed time since an ISO timestamp as H:MM, e.g. "1:03".
export function formatElapsedHm(fromIso: string): string {
  const elapsedMs = Math.max(0, Date.now() - new Date(fromIso).getTime());
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

