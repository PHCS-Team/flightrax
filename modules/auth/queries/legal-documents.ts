import { queryOptions } from "@tanstack/react-query";

import { LEGAL_DOCUMENTS } from "@/modules/auth/constants/legal-documents";
import type { LegalDocumentKind } from "@/modules/auth/types/legal-document";

export const LEGAL_DOCUMENT_KEYS = {
  all: ["legal-documents"] as const,
  detail: (kind: LegalDocumentKind) => ["legal-documents", kind] as const,
};

async function fetchLegalDocument(kind: LegalDocumentKind): Promise<string> {
  const response = await fetch(LEGAL_DOCUMENTS[kind].path);

  if (!response.ok) {
    throw new Error("This document could not be loaded. Try again.");
  }

  return response.text();
}

export function legalDocumentQueryOptions(kind: LegalDocumentKind) {
  return queryOptions({
    queryKey: LEGAL_DOCUMENT_KEYS.detail(kind),
    queryFn: () => fetchLegalDocument(kind),
    // The wording changes only when someone edits the file.
    staleTime: 60 * 60 * 1000,
  });
}
