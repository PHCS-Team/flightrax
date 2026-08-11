import type { Database } from "@/shared/types/supabase";

export type CertificateRow = Database["public"]["Tables"]["certificates"]["Row"];

export type Certificate = CertificateRow;

export type CertificateImageUrl = {
  imageUrl: string | null;
};
