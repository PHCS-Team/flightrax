"use client";

import { useQuery } from "@tanstack/react-query";

import { licenseImagesQueryOptions } from "@/shared/lib/license-images";

export function useLicenseImages(licenseId: string, enabled: boolean) {
  return useQuery(licenseImagesQueryOptions(licenseId, enabled));
}
