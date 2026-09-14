import { addDays, format, parse } from "date-fns";

import { SCHEDULE_UPLOAD_RANGE_MAX_DAYS } from "@/modules/schedule/constants/schedule-upload";

const DATE_FORMAT = "yyyy-MM-dd";

// Every date from startsOn to endsOn inclusive, capped so a mistyped year
// cannot produce thousands of days.
export function datesInRange(startsOn: string, endsOn: string): string[] {
  const start = parse(startsOn, DATE_FORMAT, new Date());
  const end = parse(endsOn, DATE_FORMAT, new Date());
  const dates: string[] = [];

  for (
    let cursor = start;
    cursor <= end && dates.length < SCHEDULE_UPLOAD_RANGE_MAX_DAYS;
    cursor = addDays(cursor, 1)
  ) {
    dates.push(format(cursor, DATE_FORMAT));
  }

  return dates;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function hasWord(haystack: string, word: string): boolean {
  return new RegExp(`(^| )${word}( |$)`).test(haystack);
}

// "Tues", "Thur", "Wednes" all read as their weekday; same for "Sept".
function hasAbbreviation(words: string[], full: string): boolean {
  return words.some((word) => word.length >= 3 && full.startsWith(word));
}

// Reads a sheet tab name ("Mon", "Tuesday", "15", "Sept 15", "09-15",
// "2026-09-15") as one of the dates the upload covers. Returns the date only
// when exactly one date in the range matches, so a weekday name inside a
// two-week range gives null rather than a guess.
export function guessSheetDate(
  sheetName: string,
  range: { startsOn: string; endsOn: string },
): string | null {
  const name = normalize(sheetName);
  const words = name.split(" ");

  if (!name) {
    return null;
  }

  const matches = datesInRange(range.startsOn, range.endsOn).filter((date) => {
    const parsed = parse(date, DATE_FORMAT, new Date());
    const day = String(parsed.getDate());
    const paddedDay = format(parsed, "dd");
    const month = String(parsed.getMonth() + 1);
    const paddedMonth = format(parsed, "MM");
    const weekday = format(parsed, "EEEE").toLowerCase();
    const monthName = format(parsed, "MMMM").toLowerCase();
    const monthWords = words.filter(
      (word) => word.length >= 3 && monthName.startsWith(word),
    );

    if (name === date || name === normalize(date)) {
      return true;
    }

    if (hasAbbreviation(words, weekday)) {
      return true;
    }

    if (
      hasWord(name, `${month} ${day}`) ||
      hasWord(name, `${paddedMonth} ${paddedDay}`) ||
      hasWord(name, `${month} ${paddedDay}`) ||
      hasWord(name, `${paddedMonth} ${day}`)
    ) {
      return true;
    }

    if (
      monthWords.some(
        (word) =>
          hasWord(name, `${word} ${day}`) ||
          hasWord(name, `${day} ${word}`) ||
          hasWord(name, `${word} ${paddedDay}`) ||
          hasWord(name, `${paddedDay} ${word}`),
      )
    ) {
      return true;
    }

    return name === day || name === paddedDay;
  });

  return matches.length === 1 ? matches[0] : null;
}
