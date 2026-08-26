import { format } from "date-fns";

import {
  DEFAULT_AERODROME_CODE,
  DEFAULT_DEPARTURE_POINT_REMARK,
} from "@/modules/flight-documents/constants/flight-plan-options";
import type { FlightPlanFilerContext } from "@/modules/flight-documents/types/filer-context";
import {
  getLicenseTypeLabel,
  getRatingLabel,
} from "@/shared/lib/aviation/license-options";

export type OtherInformationInput = {
  dofRaw: string;
  departureAerodrome: string;
  destinationAerodrome: string;
  firstAlternateAerodrome: string;
  secondAlternateAerodrome: string;
};

// License types and ratings are stored as underscored keys — use the
// canonical labels, falling back to humanizing unknown values.
function humanize(value: string) {
  return value
    .replace(/_RATING$/i, "")
    .replaceAll("_", " ")
    .toUpperCase();
}

function licenseTypeLabel(value: string) {
  return (getLicenseTypeLabel(value) ?? humanize(value)).toUpperCase();
}

function ratingLabel(value: string) {
  const label = getRatingLabel(value);

  return (label ? label.replace(/ Rating$/, "") : humanize(value)).toUpperCase();
}

function formatExpiry(expiryDate: string | null, hasNoExpiry: boolean) {
  if (hasNoExpiry) {
    return "NO EXPIRY";
  }

  if (!expiryDate) {
    return "—";
  }

  return format(new Date(`${expiryDate}T00:00:00`), "MM/dd/yyyy");
}

function roleLabel(role: FlightPlanFilerContext["profile"]["role"]) {
  if (role === "student") {
    return "STUDENT";
  }

  if (role === "instructor") {
    return "FI";
  }

  return role.toUpperCase();
}

function isZzzz(aerodrome: string) {
  return aerodrome.trim().toUpperCase() === DEFAULT_AERODROME_CODE;
}

// Default Item 18 (Other Information) text, one item per line. Per the
// filing guideline, a ZZZZ aerodrome must be specified here: DEP/ for
// departure, DEST/ for destination, ALTN/ for alternates. The school's
// home field is the default location. Auto-filled but user-editable.
export function buildOtherInformation(
  input: OtherInformationInput,
  context: FlightPlanFilerContext,
): string {
  const licenseSegments = context.licenses.map((license) =>
    [
      `${licenseTypeLabel(license.licenseType)} ${license.licenseNumber}`,
      license.ratings.length > 0
        ? license.ratings.map(ratingLabel).join(" / ")
        : "—",
      formatExpiry(license.expiryDate, license.hasNoExpiry),
    ].join(" | "),
  );

  const remark = [
    context.profile.fullName.toUpperCase(),
    ...licenseSegments,
  ].join(" | ");

  const lines = [`DOF/ ${input.dofRaw}`];

  if (isZzzz(input.departureAerodrome)) {
    lines.push(`DEP/ ${DEFAULT_DEPARTURE_POINT_REMARK}`);
  }

  if (isZzzz(input.destinationAerodrome)) {
    lines.push(`DEST/ ${DEFAULT_DEPARTURE_POINT_REMARK}`);
  }

  if (
    isZzzz(input.firstAlternateAerodrome) ||
    isZzzz(input.secondAlternateAerodrome)
  ) {
    lines.push(`ALTN/ ${DEFAULT_DEPARTURE_POINT_REMARK}`);
  }

  lines.push(`RMK/ ${roleLabel(context.profile.role)}: ${remark}`);

  return lines.join("\n");
}
