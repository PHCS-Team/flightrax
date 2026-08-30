import { format } from "date-fns";

// Display formatting for the flight status board.

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// "Bautista, Kenneth" / "KENNETH BAUTISTA" → "K. Bautista". Handles
// both "Last, First" and "First Last" shapes; names are stored in
// mixed or full uppercase.
export function formatShortPersonName(fullName: string): string {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return "—";
  }

  let first = "";
  let last = "";

  if (trimmed.includes(",")) {
    const [lastPart, firstPart] = trimmed.split(",");
    last = lastPart.trim();
    first = (firstPart ?? "").trim();
  } else {
    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      return toTitleCase(parts[0]);
    }

    first = parts[0];
    last = parts[parts.length - 1];
  }

  const initial = first.charAt(0).toUpperCase();
  const lastLabel = toTitleCase(last);

  return initial ? `${initial}. ${lastLabel}` : lastLabel;
}

// Postgres interval text ("01:30:00") → "01:30".
export function formatIntervalHm(value: string): string {
  const match = value.match(/^(\d+):(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

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
