"use client";

import { useQuery } from "@tanstack/react-query";

import { certificateImageQueryOptions } from "@/shared/lib/certificate-images";

export function useCertificateImage(certificateId: string, enabled: boolean) {
  return useQuery(certificateImageQueryOptions(certificateId, enabled));
}
