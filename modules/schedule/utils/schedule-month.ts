import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
  addDays,
} from "date-fns";

import { operationsToday } from "@/modules/schedule/utils/schedule-time";

const MONTH_FORMAT = "yyyy-MM";
const DATE_FORMAT = "yyyy-MM-dd";

function parseMonth(month: string): Date {
  return parse(month, MONTH_FORMAT, new Date());
}

export function isMonthString(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value) && isValid(parseMonth(value));
}

export function operationsMonth(): string {
  return operationsToday().slice(0, 7);
}

export function monthOfDate(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, months: number): string {
  return format(addMonths(parseMonth(month), months), MONTH_FORMAT);
}

export function formatMonthLabel(month: string, pattern = "MMMM yyyy"): string {
  return format(parseMonth(month), pattern);
}

// First and last calendar date of the month, YYYY-MM-DD.
export function monthBounds(month: string): { first: string; last: string } {
  const date = parseMonth(month);

  return {
    first: format(startOfMonth(date), DATE_FORMAT),
    last: format(endOfMonth(date), DATE_FORMAT),
  };
}

// The dates a month calendar paints: whole weeks, Sunday to Saturday, from
// the week holding the 1st to the week holding the last day.
export function monthCalendarDates(month: string): string[] {
  const date = parseMonth(month);
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  const dates: string[] = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(format(cursor, DATE_FORMAT));
  }

  return dates;
}
