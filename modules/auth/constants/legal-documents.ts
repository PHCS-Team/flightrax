import type { LegalDocumentKind } from "@/modules/auth/types/legal-document";

// The markdown lives in public/ so the school can replace the wording by
// editing the file: no rebuild, no code change.
export const LEGAL_DOCUMENTS: Record<
  LegalDocumentKind,
  { path: string; title: string }
> = {
  privacy: { path: "/legal/privacy-policy.md", title: "Privacy Policy" },
  terms: {
    path: "/legal/terms-and-conditions.md",
    title: "Terms and Conditions",
  },
};
