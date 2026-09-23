"use client";

import { useQuery } from "@tanstack/react-query";

import { legalDocumentQueryOptions } from "@/modules/auth/queries/legal-documents";
import type { LegalDocumentKind } from "@/modules/auth/types/legal-document";

export function useLegalDocument(kind: LegalDocumentKind, enabled: boolean) {
  return useQuery({ ...legalDocumentQueryOptions(kind), enabled });
}
