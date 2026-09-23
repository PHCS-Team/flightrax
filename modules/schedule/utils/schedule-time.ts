import { addDays, format, isValid, parse, startOfWeek } from "date-fns";

import { OPERATIONS_TIME_ZONE } from "@/shared/lib/aviation/operations-time-zone";

// The board is read in school-local time. The Philippines has no DST, so a
// fixed offset is enough to turn a picked date + clock time into the instant
// stored in starts_at/ends_at, and back.
const APP_UTC_OFFSET = "+08:00";
const DATE_FORMAT = "yyyy-MM-dd";

export const MINUTES_PER_DAY = 24 * 60;

// Today's calendar date at the school, YYYY-MM-DD, wherever the browser or
// server happens to be.
export function operationsToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OPERATIONS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Plain calendar arithmetic on date strings. These parse as local dates and
// are only ever used for day math and labels, never for instants.
function parseDate(date: string): Date {
  return parse(date, DATE_FORMAT, new Date());
}

export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseDate(value));
}

export function shiftDate(date: string, days: number): string {
  return format(addDays(parseDate(date), days), DATE_FORMAT);
}

// Sunday to Saturday around the given date, the way the wall board is read.
export function weekOf(date: string): string[] {
  const start = startOfWeek(parseDate(date));

  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(start, index), DATE_FORMAT),
  );
}

export function formatDateLabel(date: string, pattern: string): string {
  return format(parseDate(date), pattern);
}

// The instant a school-local date begins.
export function dayStart(date: string): Date {
  return new Date(`${date}T00:00:00${APP_UTC_OFFSET}`);
}

export function dayEnd(date: string): Date {
  return new Date(dayStart(date).getTime() + MINUTES_PER_DAY * 60_000);
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

// A picked date + "HH:mm" (24:00 allowed for end of day) as the ISO instant
// to store.
export function toInstant(date: string, time: string): string {
  return new Date(
    dayStart(date).getTime() + timeToMinutes(time) * 60_000,
  ).toISOString();
}

// Minutes from the start of a school-local date to an instant. Negative or
// past 1440 when the instant falls outside that day.
export function minutesIntoDay(iso: string, date: string): number {
  return (new Date(iso).getTime() - dayStart(date).getTime()) / 60_000;
}

// The school-local date an instant falls on.
export function dateOfInstant(iso: string): string {
  return operationsToday(new Date(iso));
}

// The "HH:mm" an instant reads as on a given date's board, clamped to that
// day so an entry that runs past midnight edits as ending at 24:00.
export function timeOnDate(iso: string, date: string): string {
  const minutes = Math.round(minutesIntoDay(iso, date));

  return minutesToTime(Math.min(MINUTES_PER_DAY, Math.max(0, minutes)));
}

// Compact 12-hour range for a block: "6-8AM", "11AM-12PM", "1:30-3PM".
// Clamped to the board's day, and a bar that fills the day reads "All day".
export function formatClockRange(
  startsAt: string,
  endsAt: string,
  date: string,
): string {
  const clamp = (iso: string) =>
    Math.min(
      MINUTES_PER_DAY,
      Math.max(0, Math.round(minutesIntoDay(iso, date))),
    );
  const start = clamp(startsAt);
  const end = clamp(endsAt);

  if (start === 0 && end === MINUTES_PER_DAY) {
    return "All day";
  }

  const suffix = (minutes: number) =>
    minutes < 12 * 60 || minutes === MINUTES_PER_DAY ? "AM" : "PM";
  const clock = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const rest = minutes % 60;
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return rest === 0
      ? String(hour12)
      : `${hour12}:${String(rest).padStart(2, "0")}`;
  };

  return suffix(start) === suffix(end)
    ? `${clock(start)}-${clock(end)}${suffix(end)}`
    : `${clock(start)}${suffix(start)}-${clock(end)}${suffix(end)}`;
}

export function formatTimeLabel(time: string): string {
  const minutes = timeToMinutes(time);

  if (minutes === MINUTES_PER_DAY) {
    return "12:00 AM (end of day)";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const suffix = hours < 12 ? "AM" : "PM";
  const clock = hours % 12 === 0 ? 12 : hours % 12;
  const padded = String(rest).padStart(2, "0");

  return `${clock}:${padded} ${suffix} (${String(hours).padStart(2, "0")}:${padded})`;
}

// Column header for the hour starting at `hour`: "6-7AM", "11AM-12PM".
export function formatHourColumn(hour: number): string {
  const endHour = hour + 1;
  const startClock = hour % 12 === 0 ? 12 : hour % 12;
  const endClock = endHour % 12 === 0 ? 12 : endHour % 12;
  const startSuffix = hour < 12 ? "AM" : "PM";
  const endSuffix = endHour < 12 || endHour === 24 ? "AM" : "PM";

  return startSuffix === endSuffix
    ? `${startClock}-${endClock}${endSuffix}`
    : `${startClock}${startSuffix}-${endClock}${endSuffix}`;
}
