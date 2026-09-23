import type { Database } from "@/shared/types/supabase";

export type CertificateRow =
  Database["public"]["Tables"]["certificates"]["Row"];

export type Certificate = CertificateRow;

export type CertificateImageRow =
  Database["public"]["Tables"]["certificate_images"]["Row"];

export type CertificateImage = {
  id: string;
  position: number;
  url: string | null;
  isMain: boolean;
};

export type CertificateImages = {
  images: CertificateImage[];
};
