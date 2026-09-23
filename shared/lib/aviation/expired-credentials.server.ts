import "server-only";

import { isCertificateExpired } from "@/shared/lib/aviation/certificate-validity";
import { describeExpiredCredentials } from "@/shared/lib/aviation/expired-credentials";
import {
  getTodayIsoDate,
  isLicenseExpired,
} from "@/shared/lib/aviation/license-validity";
import { LICENSE_TYPE_OPTIONS } from "@/shared/lib/aviation/license-options";
import { describeActionError } from "@/shared/lib/action-error";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { ExpiredCredential } from "@/shared/types/credentials";

function licenseLabel(licenseType: string) {
  return (
    LICENSE_TYPE_OPTIONS.find((option) => option.value === licenseType)
      ?.abbreviation ?? licenseType
  );
}

function addCredential(
  byProfile: Map<string, ExpiredCredential[]>,
  profileId: string,
  credential: ExpiredCredential,
) {
  const existing = byProfile.get(profileId) ?? [];

  existing.push(credential);
  byProfile.set(profileId, existing);
}

// Licenses and certificates that lapsed, per person. A certificate without
// an expiry date never lapses, and someone with no documents has none.
export async function getExpiredCredentialsByProfile(
  profileIds: readonly string[],
  todayIso = getTodayIsoDate(),
): Promise<Map<string, ExpiredCredential[]>> {
  const byProfile = new Map<string, ExpiredCredential[]>();

  if (profileIds.length === 0) {
    return byProfile;
  }

  const supabase = createAdminClient();
  const [licenses, certificates] = await Promise.all([
    supabase
      .from("licenses")
      .select("user_id, license_type, status, expiry_date, has_no_expiry")
      .in("user_id", profileIds),
    supabase
      .from("certificates")
      .select("user_id, title, expiry_date, has_no_expiry")
      .in("user_id", profileIds),
  ]);

  if (licenses.error) {
    throw new Error(describeActionError(licenses.error));
  }

  if (certificates.error) {
    throw new Error(describeActionError(certificates.error));
  }

  for (const license of licenses.data ?? []) {
    if (!isLicenseExpired(license, todayIso)) {
      continue;
    }

    addCredential(byProfile, license.user_id, {
      label: licenseLabel(license.license_type),
      expiredOn: license.expiry_date,
    });
  }

  for (const certificate of certificates.data ?? []) {
    if (!isCertificateExpired(certificate, todayIso)) {
      continue;
    }

    addCredential(byProfile, certificate.user_id, {
      label: certificate.title,
      expiredOn: certificate.expiry_date,
    });
  }

  return byProfile;
}

export async function getExpiredCredentials(
  profileId: string,
  todayIso = getTodayIsoDate(),
): Promise<ExpiredCredential[]> {
  const byProfile = await getExpiredCredentialsByProfile([profileId], todayIso);

  return byProfile.get(profileId) ?? [];
}

type CrewMember = {
  id: string | null | undefined;
  // "self" speaks to the person acting; any other value names them to
  // someone else, e.g. "pilot in command".
  role: string;
};

// The first crew member holding a lapsed licence or certificate, as the
// message to show. Null when everyone's documents are current.
export async function findExpiredCredentialBlock(
  crew: readonly CrewMember[],
): Promise<string | null> {
  const present = crew.filter(
    (member): member is CrewMember & { id: string } => Boolean(member.id),
  );
  const byProfile = await getExpiredCredentialsByProfile([
    ...new Set(present.map((member) => member.id)),
  ]);

  for (const member of present) {
    const expired = byProfile.get(member.id);

    if (!expired || expired.length === 0) {
      continue;
    }

    if (member.role === "self") {
      return `Renew your expired documents first: ${describeExpiredCredentials(expired)}.`;
    }

    return `The selected ${member.role} has expired documents: ${describeExpiredCredentials(expired)}. Choose someone else.`;
  }

  return null;
}
