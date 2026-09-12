// Date helpers for the schedule board. All schedule dates are zulu
// calendar dates (YYYY-MM-DD), so every helper works with UTC arithmetic
// to avoid local-timezone drift.

const WEEK_STARTS_ON = 0;

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function partsOf(ymd: string): [number, number, number] {
  const [year, month, day] = ymd.split("-").map(Number);

  return [year, month, day];
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeMonth(month: string | null): string {
  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return month;
  }

  return currentMonthKey();
}

export function normalizeDateKey(date: string | null): string {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return todayDateKey();
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = partsOf(`${monthKey}-01`);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export function shiftDateKey(dateKey: string, delta: number): string {
  const [year, month, day] = partsOf(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + delta));

  return toKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function monthLabel(monthKey: string): string {
  const [year, month] = partsOf(`${monthKey}-01`);

  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDateKey(dateKey: string): string {
  const [, month, day] = partsOf(dateKey);

  return `${SHORT_MONTH_NAMES[month - 1]} ${day}`;
}

export function formatDateRange(startsOn: string, endsOn: string): string {
  if (startsOn === endsOn) {
    return formatDateKey(startsOn);
  }

  return `${formatDateKey(startsOn)} – ${formatDateKey(endsOn)}`;
}

export function expandDateRange(startsOn: string, endsOn: string): string[] {
  const [sy, sm, sd] = partsOf(startsOn);
  const [ey, em, ed] = partsOf(endsOn);
  const cursor = new Date(Date.UTC(sy, sm - 1, sd));
  const last = new Date(Date.UTC(ey, em - 1, ed));
  const days: string[] = [];

  while (cursor.getTime() <= last.getTime()) {
    days.push(
      toKey(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate()),
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function isDateKeyInRange(
  dateKey: string,
  startsOn: string,
  endsOn: string,
): boolean {
  return dateKey >= startsOn && dateKey <= endsOn;
}

// Monday-first-friendly weekday label list. Kept aligned with
// WEEK_STARTS_ON (0 = Sunday).
export const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

// Always returns a full 6-week (42 day) grid starting on the week's
// first day so the calendar keeps a stable height.
export function getCalendarDays(monthKey: string): string[] {
  const [year, month] = partsOf(`${monthKey}-01`);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const offset = (firstOfMonth.getUTCDay() - WEEK_STARTS_ON + 7) % 7;
  const start = new Date(Date.UTC(year, month - 1, 1 - offset));

  return Array.from({ length: 42 }, (_unused, index) => {
    const date = new Date(start);

    date.setUTCDate(start.getUTCDate() + index);

    return toKey(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
  });
}

export function formatDayNumber(dateKey: string): string {
  const [, , day] = partsOf(dateKey);

  return String(day);
}

// Returns the 7 date keys (YYYY-MM-DD) of the week containing the given
// date key. The week runs from WEEK_STARTS_ON (default: Sunday).
export function getWeekDays(dateKey: string): string[] {
  const [year, month, day] = partsOf(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const offset = (weekday - WEEK_STARTS_ON + 7) % 7;

  return Array.from({ length: 7 }, (_unused, index) => {
    const cursor = new Date(
      Date.UTC(year, month - 1, day - offset + index),
    );

    return toKey(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth() + 1,
      cursor.getUTCDate(),
    );
  });
}

export function isDayInMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(monthKey);
}

export function isTodayDateKey(dateKey: string): boolean {
  return dateKey === todayDateKey();
}