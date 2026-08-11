import type { Database } from "@/shared/types/supabase";

type CertificateRow = Database["public"]["Tables"]["certificates"]["Row"];

/**
 * Compact projection of a certificate used for list/table display.
 * Deliberately excludes the image payload metadata columns (content type,
 * size, uploaded_at) so list queries stay light; the details view fetches
 * the image URL on demand by certificate id.
 */
export type CertificateSummary = Pick<
  CertificateRow,
  | "id"
  | "user_id"
  | "title"
  | "description"
  | "expiry_date"
  | "has_no_expiry"
  | "created_at"
  | "image_path"
>;
