import { format } from "date-fns";

import type {
  LicenseShortForm,
  LicenseShortFormSource,
} from "@/modules/flight-documents/types/license-short-form";
import { getLicenseTypeAbbreviation } from "@/shared/lib/aviation/license-options";
import { resolveRating } from "@/shared/lib/aviation/ratings";
import type { RatingOption } from "@/shared/types/rating-option";

function humanizeLicenseType(value: string) {
  return value.replace(/_license$/i, "").replaceAll("_", " ").toUpperCase();
}

// Resolves a stored license (type key + rating keys) to its short form
// against the current rating options.
export function toLicenseShortForm(
  license: LicenseShortFormSource,
  ratingOptions: readonly RatingOption[],
): LicenseShortForm {
  return {
    licenseNumber: license.licenseNumber,
    licenseTypeAbbreviation:
      getLicenseTypeAbbreviation(license.licenseType) ??
      humanizeLicenseType(license.licenseType),
    ratingAbbreviations: license.ratings.map(
      (rating) => resolveRating(rating, ratingOptions).abbreviation,
    ),
    expiryDate: license.expiryDate,
    hasNoExpiry: license.hasNoExpiry,
  };
}

function formatExpiry(license: LicenseShortForm) {
  if (license.hasNoExpiry) {
    return "NO EXPIRY";
  }

  if (!license.expiryDate) {
    return "";
  }

  return format(new Date(`${license.expiryDate}T00:00:00`), "dd MMM ''yy").toUpperCase();
}

// One line for one or more licenses, as printed on the flight plan's
// signature block and in the Item 18 RMK/ entry:
// "123456-CPL | C152/IR | 15 MAR '25; 654321-PPL | IR | NO EXPIRY".
export function formatLicenseLine(licenses: readonly LicenseShortForm[]): string {
  return licenses
    .map((license) =>
      [
        `${license.licenseNumber}-${license.licenseTypeAbbreviation}`,
        license.ratingAbbreviations.join("/") || null,
        formatExpiry(license) || null,
      ]
        .filter(Boolean)
        .join(" | "),
    )
    .join("; ");
}
