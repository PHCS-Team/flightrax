import type { Database } from "@/shared/types/supabase";

export type LicenseRow = Database["public"]["Tables"]["licenses"]["Row"];

export type License = LicenseRow;

export type LicenseStatus = Database["public"]["Enums"]["license_status"];

export type LicenseImageUrls = {
  frontUrl: string | null;
  backUrl: string | null;
};
