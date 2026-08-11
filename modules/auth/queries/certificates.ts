import { queryOptions } from "@tanstack/react-query";

import { fetchOwnCertificates } from "@/modules/auth/services/certificates.client";
import type { CertificateImageUrl } from "@/modules/auth/types/certificate";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export const CERTIFICATE_QUERY_KEYS = {
  all: ["auth", "certificates"] as const,
  list: ["auth", "certificates", "list"] as const,
  image: (certificateId: string) =>
    ["auth", "certificates", "image", certificateId] as const,
};

export function certificatesQueryOptions() {
  return queryOptions({
    queryFn: fetchOwnCertificates,
    queryKey: CERTIFICATE_QUERY_KEYS.list,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchCertificateImageUrl(
  certificateId: string,
): Promise<CertificateImageUrl> {
  const response = await fetch(`/api/auth/certificates/${certificateId}/image`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load certificate image."),
    );
  }

  return (await response.json()) as CertificateImageUrl;
}

export function certificateImageQueryOptions(
  certificateId: string,
  enabled: boolean,
) {
  return queryOptions({
    queryFn: () => fetchCertificateImageUrl(certificateId),
    queryKey: CERTIFICATE_QUERY_KEYS.image(certificateId),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
