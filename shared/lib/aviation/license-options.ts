export const LICENSE_TYPE_VALUES = [
  "student_pilot_license",
  "private_pilot_license",
  "commercial_pilot_license",
  "flight_instructor_license",
] as const;

export const LICENSE_TYPE_OPTIONS = [
  {
    value: "student_pilot_license",
    label: "Student Pilot License",
    abbreviation: "SPL",
  },
  {
    value: "private_pilot_license",
    label: "Private Pilot License",
    abbreviation: "PPL",
  },
  {
    value: "commercial_pilot_license",
    label: "Commercial Pilot License",
    abbreviation: "CPL",
  },
  {
    value: "flight_instructor_license",
    label: "Flight Instructor License",
    abbreviation: "FI",
  },
] as const satisfies ReadonlyArray<{
  abbreviation: string;
  label: string;
  value: (typeof LICENSE_TYPE_VALUES)[number];
}>;

export type LicenseTypeValue = (typeof LICENSE_TYPE_OPTIONS)[number]["value"];

export function getLicenseTypeLabel(value: string | null) {
  return (
    LICENSE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? null
  );
}

export function getLicenseTypeAbbreviation(value: string | null) {
  return (
    LICENSE_TYPE_OPTIONS.find((option) => option.value === value)
      ?.abbreviation ?? null
  );
}

export function isLicenseTypeValue(
  value: string | null,
): value is LicenseTypeValue {
  return LICENSE_TYPE_VALUES.some((option) => option === value);
}
