"use client";

import { useQuery } from "@tanstack/react-query";

import { certificateImagesQueryOptions } from "@/shared/lib/certificate-images";

export function useCertificateImages(certificateId: string, enabled: boolean) {
  return useQuery(certificateImagesQueryOptions(certificateId, enabled));
}
