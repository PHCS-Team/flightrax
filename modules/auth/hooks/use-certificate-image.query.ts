"use client";

import { useQuery } from "@tanstack/react-query";

import { certificateImageQueryOptions } from "@/modules/auth/queries/certificates";

export function useCertificateImage(certificateId: string, enabled: boolean) {
  return useQuery(certificateImageQueryOptions(certificateId, enabled));
}
