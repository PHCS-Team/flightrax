import { queryOptions } from "@tanstack/react-query";

import type { LicenseImageUrls } from "@/shared/types/license";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export const LICENSE_IMAGE_QUERY_KEYS = {
  all: ["auth", "licenses", "images"] as const,
  detail: (licenseId: string) =>
    ["auth", "licenses", "images", licenseId] as const,
};

export async function fetchLicenseImageUrls(
  licenseId: string,
): Promise<LicenseImageUrls> {
  const response = await fetch(`/api/auth/licenses/${licenseId}/images`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load license photos."),
    );
  }

  return (await response.json()) as LicenseImageUrls;
}

export function licenseImagesQueryOptions(
  licenseId: string,
  enabled: boolean,
) {
  return queryOptions({
    queryFn: () => fetchLicenseImageUrls(licenseId),
    queryKey: LICENSE_IMAGE_QUERY_KEYS.detail(licenseId),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
