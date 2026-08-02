import type { Database } from "@/shared/types/supabase";

type LicenseRow = Database["public"]["Tables"]["licenses"]["Row"];

/**
 * Compact projection of a license used for list/table display.
 * Deliberately excludes the ID photo payload metadata columns
 * (content type, size, uploaded_at) so list queries stay light;
 * the details view fetches photo URLs on demand by license id.
 */
export type LicenseSummary = Pick<
  LicenseRow,
  | "id"
  | "user_id"
  | "license_type"
  | "license_number"
  | "ratings"
  | "status"
  | "expiry_date"
  | "has_no_expiry"
  | "created_at"
  | "id_front_path"
  | "id_back_path"
>;
