// All flight plan times are zulu (UTC). Raw values keep the exact filed
// format; these helpers produce the resolved, computable counterparts.

// DOF is DDHHMM (day of month + filing time in zulu). Resolve it against
// the current UTC month; a day earlier than today means the next month
// (plans are filed at most a day ahead, never weeks back).
export function resolveDof(dofRaw: string): string {
  const day = Number(dofRaw.slice(0, 2));
  const hour = Number(dofRaw.slice(2, 4));
  const minute = Number(dofRaw.slice(4, 6));
  const now = new Date();
  const month =
    day < now.getUTCDate() ? now.getUTCMonth() + 1 : now.getUTCMonth();

  return new Date(
    Date.UTC(now.getUTCFullYear(), month, day, hour, minute),
  ).toISOString();
}

// HHMM zulu → postgres time value.
export function hhmmToTime(hhmm: string): string {
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00`;
}

// HHMM duration → postgres interval value.
export function hhmmToInterval(hhmm: string): string {
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00`;
}
