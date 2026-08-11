import "server-only";

import { cache } from "react";

import type {
  Certificate,
  CertificateImageUrl,
} from "@/modules/auth/types/certificate";
import { CERTIFICATE_IMAGES_BUCKET } from "@/shared/lib/storage/buckets";
import { createClient } from "@/shared/lib/supabase/server";

const CERTIFICATE_IMAGE_URL_EXPIRY_SECONDS = 60 * 60;

const OWN_CERTIFICATE_SELECT =
  "id, user_id, title, description, has_no_expiry, expiry_date, image_path, image_content_type, image_size_bytes, image_uploaded_at, created_at, updated_at";

export const getOwnCertificates = cache(
  async function getOwnCertificates(): Promise<Certificate[]> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // RLS alone is not enough here: staff read policies expose every row, so
    // "own" must be enforced explicitly.
    const { data, error } = await supabase
      .from("certificates")
      .select(OWN_CERTIFICATE_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
);

export async function getCertificateImageSignedUrl(
  certificateId: string,
): Promise<CertificateImageUrl | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("image_path")
    .eq("id", certificateId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (!data.image_path) {
    return { imageUrl: null };
  }

  const { data: signed } = await supabase.storage
    .from(CERTIFICATE_IMAGES_BUCKET)
    .createSignedUrl(data.image_path, CERTIFICATE_IMAGE_URL_EXPIRY_SECONDS);

  return { imageUrl: signed?.signedUrl ?? null };
}
