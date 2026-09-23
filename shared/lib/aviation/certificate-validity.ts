import { getTodayIsoDate } from "@/shared/lib/aviation/license-validity";

export type CertificateValidityInput = {
  has_no_expiry: boolean;
  expiry_date: string | null;
};

export function isCertificateExpired(
  certificate: CertificateValidityInput,
  todayIso = getTodayIsoDate(),
) {
  return (
    !certificate.has_no_expiry &&
    certificate.expiry_date !== null &&
    certificate.expiry_date < todayIso
  );
}
