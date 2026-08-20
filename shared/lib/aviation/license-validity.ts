import type { Database } from "@/shared/types/supabase";

// Minimal shape needed to judge validity — satisfied by license rows and
// module-level projections alike.
export type LicenseValidityInput = {
  status: Database["public"]["Enums"]["license_status"];
  has_no_expiry: boolean;
  expiry_date: string | null;
};

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isLicenseExpired(
  license: LicenseValidityInput,
  todayIso = getTodayIsoDate(),
) {
  return (
    license.status === "expired" ||
    (!license.has_no_expiry &&
      license.expiry_date !== null &&
      license.expiry_date < todayIso)
  );
}

export function isLicenseValid(
  license: LicenseValidityInput,
  todayIso = getTodayIsoDate(),
) {
  return license.status === "active" && !isLicenseExpired(license, todayIso);
}
