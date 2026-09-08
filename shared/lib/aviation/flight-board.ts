import type { Database } from "@/shared/types/supabase";

// Display helpers shared by the dashboard boards and the public flight
// monitor: names, zulu clock times, spans, and the two per-row alerts.

type JourneyStatus = Database["public"]["Enums"]["journey_status"];

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// "Bautista, Kenneth" / "KENNETH BAUTISTA" → "K. Bautista". Handles both
// "Last, First" and "First Last" shapes; names are stored in mixed or
// full uppercase.
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

// ISO timestamp → zulu clock time as HH:MM, e.g. "02:00" for 10:00 AM
// Philippine time.
export function formatZuluHm(iso: string): string {
  const date = new Date(iso);

  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

// Span between an ISO start and an end (ISO or epoch ms) as H:MM.
export function formatSpanHm(startIso: string, end: string | number): string {
  const endMs = typeof end === "number" ? end : new Date(end).getTime();
  const totalMinutes = Math.max(
    0,
    Math.floor((endMs - new Date(startIso).getTime()) / 60000),
  );

  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

// "HH:MM" (formatted EET) → minutes, or null when unparseable.
export function hmToMinutes(value: string): number | null {
  const match = value.match(/^(\d+):(\d{2})$/);

  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

// A scheduled (on-ground) flight whose filed DOF has passed without
// being commenced — shown as "Delayed".
export function isJourneyOverdue(
  journeyStatus: JourneyStatus,
  dofAt: string | null,
  nowMs: number,
): boolean {
  return (
    journeyStatus === "scheduled" &&
    nowMs > 0 &&
    dofAt !== null &&
    new Date(dofAt).getTime() < nowMs
  );
}

// An active flight airborne longer than its filed total EET ("HH:MM").
export function isJourneyPastEet(
  journey: {
    status: JourneyStatus;
    commencedAt: string | null;
    totalEet: string;
  },
  nowMs: number,
): boolean {
  if (journey.status !== "active" || !journey.commencedAt || nowMs === 0) {
    return false;
  }

  const eetMinutes = hmToMinutes(journey.totalEet);

  if (eetMinutes === null) {
    return false;
  }

  const airborneMinutes = Math.floor(
    (nowMs - new Date(journey.commencedAt).getTime()) / 60000,
  );

  return airborneMinutes > eetMinutes;
}
