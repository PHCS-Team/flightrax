import { format } from "date-fns";

// The Philippines has no DST, so a fixed offset is enough. The server runs
// in UTC, so "end of the chosen day" has to say which day it means.
const APP_UTC_OFFSET = "+08:00";

// Browser-local calendar date, YYYY-MM-DD, for the picker's default/min.
export function todayDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// Last instant of the chosen calendar date in Philippine time, as the ISO
// timestamp stored in expires_at.
export function endOfDay(date: string): string {
  return new Date(`${date}T23:59:59.999${APP_UTC_OFFSET}`).toISOString();
}

export function isNotamExpired(expiresAt: string, now = Date.now()): boolean {
  return new Date(expiresAt).getTime() < now;
}
