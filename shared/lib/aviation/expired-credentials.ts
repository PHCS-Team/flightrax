import { format } from "date-fns";

import type { ExpiredCredential } from "@/shared/types/credentials";

export function describeExpiredCredential(credential: ExpiredCredential) {
  if (!credential.expiredOn) {
    return `${credential.label} expired`;
  }

  return `${credential.label} expired ${format(
    new Date(`${credential.expiredOn}T00:00:00`),
    "d MMM yyyy",
  )}`;
}

export function describeExpiredCredentials(
  expired: readonly ExpiredCredential[],
) {
  return expired.map(describeExpiredCredential).join(", ");
}
