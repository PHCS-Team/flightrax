import { OPERATIONS_TIME_ZONE } from "@/modules/flight-documents/constants/flight-plan-options";

// Flight plan TIMES are zulu (UTC). The DOF's DAY is not: DD of DDHHMM
// is the school's local calendar date (Asia/Manila), followed by the
// zulu clock time. 050800 = the 5th (local) at 0800Z = 4:00 PM local.
// A local day runs 1600Z of the previous zulu date to 1600Z of its own,
// so a zulu time of 1600 or later falls on the previous zulu date — a
// 052300 morning slot resolves to the 4th 2300Z (7:00 AM local on the
// 5th), never the 5th 2300Z. Raw values keep the exact filed format;
// these helpers produce the resolved, computable counterparts.

const DAY_MS = 24 * 60 * 60 * 1000;

type ZonedParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

// Offset of `timeZone` from UTC at `date`, in ms (positive east of UTC).
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const zoned = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
  );

  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

// The local calendar day the DOF names, resolved against the current
// local month: a day earlier than today means next month (plans are
// filed at most a day ahead, never weeks back). Returns UTC ms of that
// day's 00:00 *as if* it were UTC — callers apply the zone offset.
function resolveDofDayUtcMs(dofRaw: string): number {
  const day = Number(dofRaw.slice(0, 2));
  const today = getZonedParts(new Date(), OPERATIONS_TIME_ZONE);
  const monthIndex = day < today.day ? today.month : today.month - 1;

  return Date.UTC(today.year, monthIndex, day);
}

// DDHHMM → ISO timestamp of the instant during the local day DD when
// the zulu clock reads HHMM.
export function resolveDof(dofRaw: string): string {
  const hour = Number(dofRaw.slice(2, 4));
  const minute = Number(dofRaw.slice(4, 6));
  const dayUtcMs = resolveDofDayUtcMs(dofRaw);
  const offsetMs = getTimeZoneOffsetMs(new Date(dayUtcMs), OPERATIONS_TIME_ZONE);
  const localDayStart = dayUtcMs - offsetMs;
  const localDayEnd = localDayStart + DAY_MS;

  let instant = dayUtcMs + hour * 60 * 60 * 1000 + minute * 60 * 1000;

  if (instant >= localDayEnd) {
    instant -= DAY_MS;
  } else if (instant < localDayStart) {
    instant += DAY_MS;
  }

  return new Date(instant).toISOString();
}

// DDHHMM → the local calendar date it names, as YYYY-MM-DD. This is the
// day availability and "today" checks compare against.
export function resolveDofDate(dofRaw: string): string {
  return new Date(resolveDofDayUtcMs(dofRaw)).toISOString().slice(0, 10);
}

// ISO instant → its local (operations) calendar date as YYYY-MM-DD.
export function toOperationsDate(iso: string): string {
  const zoned = getZonedParts(new Date(iso), OPERATIONS_TIME_ZONE);

  return `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}`;
}

// HHMM zulu → postgres time value.
export function hhmmToTime(hhmm: string): string {
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00`;
}

// HHMM duration → postgres interval value.
export function hhmmToInterval(hhmm: string): string {
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00`;
}

// Postgres interval (returned as HH:MM:SS text) → HHMM form value.
export function intervalToHhmm(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.match(/^(\d+):(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[1].padStart(2, "0")}${match[2]}`;
}
