// Form choices and field formats for the flight plan form
// (CAAP Form ATS 2019-1). Values mirror the check constraints on
// public.flight_plans — keep both in sync.

export const FLIGHT_PLAN_MESSAGE_TYPE = "FPL";

export const DEFAULT_AERODROME_CODE = "ZZZZ";

export const FLIGHT_RULES_OPTIONS = [
  { value: "I", label: "I — IFR" },
  { value: "V", label: "V — VFR" },
  { value: "Y", label: "Y — IFR then VFR" },
  { value: "Z", label: "Z — VFR then IFR" },
] as const;

export const TYPE_OF_FLIGHT_OPTIONS = [
  { value: "S", label: "S — Scheduled" },
  { value: "N", label: "N — Non-scheduled" },
  { value: "G", label: "G — General aviation" },
  { value: "M", label: "M — Military" },
  { value: "X", label: "X — Other" },
] as const;

export const WAKE_TURBULENCE_CATEGORY_OPTIONS = [
  { value: "L", label: "L — Light" },
  { value: "M", label: "M — Medium" },
  { value: "H", label: "H — Heavy" },
] as const;

export const COM_NAV_EQUIPMENT_OPTIONS = [
  { value: "N", label: "N — None" },
  { value: "S", label: "S — Standard COM/NAV/approach aid equipment" },
] as const;

export const SURVEILLANCE_EQUIPMENT_OPTIONS = [
  { value: "N", label: "N — None" },
  { value: "A", label: "A — Transponder Mode A" },
  { value: "C", label: "C — Transponder Mode A & C" },
] as const;

export const DEFAULT_DEPARTURE_POINT_REMARK = "RPT-20 BINALONAN";

export const MAX_NUMBER_OF_AIRCRAFT = 999;

// DOF (date of filing): 6 digits, DDHHMM — day of month plus filing time
// DD local date + HHMM zulu. e.g. 280100 = the 28th (local) at 0100Z; dof_resolved carries the
// full resolved timestamp.
export const DOF_PATTERN = /^\d{6}$/;

// Departure time: 4 digits, HHMM in UTC (zulu).
export const DEPARTURE_TIME_PATTERN = /^([01]\d|2[0-3])[0-5]\d$/;

// Cruising speed: K/N + 4 digits (km/h or knots) or M + 3 digits (Mach).
export const CRUISING_SPEED_PATTERN = /^(K\d{4}|N\d{4}|M\d{3})$/;

// Cruising level: F/A + 3 digits, S/M + 4 digits, or the literal VFR.
export const CRUISING_LEVEL_PATTERN = /^(F\d{3}|S\d{4}|A\d{3}|M\d{4})$/;
export const CRUISING_LEVEL_VFR = "VFR";

// Persons on board: 3 digits, or TBN (to be notified).
export const PERSONS_ON_BOARD_PATTERN = /^\d{3}$/;
export const PERSONS_ON_BOARD_TBN = "TBN";

export const MAX_DINGHIES_NUMBER = 99;
export const MAX_DINGHIES_CAPACITY = 999;

// The school's local time zone. The DOF's day (DD) and every "today"
// check are in this zone; only clock times are zulu. Mirrors
// public.operations_date() in the database.
export const OPERATIONS_TIME_ZONE = "Asia/Manila";
