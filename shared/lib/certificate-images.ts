import { queryOptions } from "@tanstack/react-query";

import type { CertificateImages } from "@/shared/types/certificate";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export const CERTIFICATE_IMAGE_QUERY_KEYS = {
  all: ["auth", "certificates", "image"] as const,
  detail: (certificateId: string) =>
    ["auth", "certificates", "image", certificateId] as const,
};

export async function fetchCertificateImages(
  certificateId: string,
): Promise<CertificateImages> {
  const response = await fetch(
    `/api/auth/certificates/${certificateId}/image`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load certificate images."),
    );
  }

  return (await response.json()) as CertificateImages;
}

export function certificateImagesQueryOptions(
  certificateId: string,
  enabled: boolean,
) {
  return queryOptions({
    queryFn: () => fetchCertificateImages(certificateId),
    queryKey: CERTIFICATE_IMAGE_QUERY_KEYS.detail(certificateId),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
