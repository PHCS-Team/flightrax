"use client";

import { useQuery } from "@tanstack/react-query";

import { certificatesQueryOptions } from "@/modules/auth/queries/certificates";

export function useCertificates() {
  return useQuery(certificatesQueryOptions());
}
