// Form choices and field formats for the flight plan form
// (CAAP Form ATS 2019-1). Values mirror the check constraints on
// public.flight_plans — keep both in sync.

export const FLIGHT_PLAN_MESSAGE_TYPE = "FPL";

export const DEFAULT_AERODROME_CODE = "ZZZZ";

export const FLIGHT_RULES_OPTIONS = [
  { value: "I", label: "IFR" },
  { value: "V", label: "VFR" },
  { value: "Y", label: "IFR then VFR (Y)" },
  { value: "Z", label: "VFR then IFR (Z)" },
] as const;

export const TYPE_OF_FLIGHT_OPTIONS = [
  { value: "S", label: "Scheduled" },
  { value: "N", label: "Non-scheduled" },
  { value: "G", label: "General aviation" },
  { value: "M", label: "Military" },
  { value: "X", label: "Other" },
] as const;

export const WAKE_TURBULENCE_CATEGORY_OPTIONS = [
  { value: "H", label: "Heavy" },
  { value: "M", label: "Medium" },
  { value: "L", label: "Light" },
] as const;

export const COM_NAV_EQUIPMENT_OPTIONS = [
  { value: "N", label: "No COM/NAV/approach aid equipment" },
  { value: "S", label: "Standard COM/NAV/approach aid equipment" },
] as const;

export const SURVEILLANCE_EQUIPMENT_OPTIONS = [
  { value: "N", label: "No surveillance equipment" },
  { value: "A", label: "Transponder Mode A" },
  { value: "C", label: "Transponder Mode A + altitude (Mode C)" },
] as const;

export const MAX_NUMBER_OF_AIRCRAFT = 999;

// DOF (date of filing): 6 digits, DDHHMM — day of month plus filing time
// in UTC (zulu). e.g. 280100 = the 28th at 0100Z; dof_resolved carries the
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
export const DEFAULT_PERSONS_ON_BOARD = "000";

export const MAX_DINGHIES_NUMBER = 99;
export const MAX_DINGHIES_CAPACITY = 999;
