export const LICENSE_TYPE_VALUES = [
  "student_pilot_license",
  "private_pilot_license",
  "commercial_pilot_license",
  "flight_instructor_license",
  "radio_telephony_license",
  "class_1_medical_certificate",
  "class_2_medical_certificate",
  "english_language_proficiency",
] as const;

export const RATING_VALUES = [
  "instrument_rating",
  "cessna_152_rating",
  "cessna_172_rating",
  "tecnam_p2002jf_rating",
  "tecnam_p_mentor_rating",
  "tecnam_p2006t_rating",
] as const;

export const LICENSE_TYPE_OPTIONS = [
  { value: "student_pilot_license", label: "Student Pilot License" },
  { value: "private_pilot_license", label: "Private Pilot License" },
  { value: "commercial_pilot_license", label: "Commercial Pilot License" },
  { value: "flight_instructor_license", label: "Flight Instructor License" },
  { value: "radio_telephony_license", label: "Radio Telephony License" },
  { value: "class_1_medical_certificate", label: "Class 1 Medical Certificate" },
  { value: "class_2_medical_certificate", label: "Class 2 Medical Certificate" },
  { value: "english_language_proficiency", label: "English Language Proficiency" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: (typeof LICENSE_TYPE_VALUES)[number];
}>;

export const RATING_OPTIONS = [
  { value: "instrument_rating", label: "Instrument Rating" },
  { value: "cessna_152_rating", label: "Cessna 152 Rating" },
  { value: "cessna_172_rating", label: "Cessna 172 Rating" },
  { value: "tecnam_p2002jf_rating", label: "Tecnam P2002JF Rating" },
  { value: "tecnam_p_mentor_rating", label: "Tecnam P-MENTOR Rating" },
  { value: "tecnam_p2006t_rating", label: "Tecnam P2006T Rating" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: (typeof RATING_VALUES)[number];
}>;

export type LicenseTypeValue = (typeof LICENSE_TYPE_OPTIONS)[number]["value"];
export type RatingValue = (typeof RATING_OPTIONS)[number]["value"];

export function getLicenseTypeLabel(value: string | null) {
  return LICENSE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function getRatingLabel(value: string | null) {
  return RATING_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function isLicenseTypeValue(value: string | null): value is LicenseTypeValue {
  return LICENSE_TYPE_VALUES.some((option) => option === value);
}

export function isRatingValue(value: string | null): value is RatingValue {
  return RATING_VALUES.some((option) => option === value);
}

export function hasMissingLicenseDetails(profile: {
  license_type: string | null;
  license_number: string | null;
  rating: string | null;
}) {
  return !profile.license_type || !profile.license_number || !profile.rating;
}
