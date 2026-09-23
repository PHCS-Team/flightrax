import "server-only";

import { cache } from "react";

import type {
  Certificate,
  CertificateImages,
} from "@/shared/types/certificate";
import { CERTIFICATE_IMAGES_BUCKET } from "@/shared/lib/storage/buckets";
import { createClient } from "@/shared/lib/supabase/server";
import { describeActionError } from "@/shared/lib/action-error";

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
      throw new Error(describeActionError(error));
    }

    return data ?? [];
  },
);

export async function getCertificateImageSignedUrls(
  certificateId: string,
): Promise<CertificateImages | null> {
  const supabase = await createClient();
  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("id, image_path")
    .eq("id", certificateId)
    .maybeSingle();

  if (error || !certificate) {
    return null;
  }

  const { data: extras, error: extrasError } = await supabase
    .from("certificate_images")
    .select("id, image_path")
    .eq("certificate_id", certificateId)
    .order("position", { ascending: true });

  if (extrasError) {
    throw new Error(describeActionError(extrasError));
  }

  // The main image lives on the certificate row; the rest follow it.
  const sources = [
    ...(certificate.image_path
      ? [{ id: "main", path: certificate.image_path, isMain: true }]
      : []),
    ...(extras ?? []).map((row) => ({
      id: row.id,
      path: row.image_path,
      isMain: false,
    })),
  ];

  const images = await Promise.all(
    sources.map(async (source, index) => {
      const { data: signed } = await supabase.storage
        .from(CERTIFICATE_IMAGES_BUCKET)
        .createSignedUrl(source.path, CERTIFICATE_IMAGE_URL_EXPIRY_SECONDS);

      return {
        id: source.id,
        position: index + 1,
        isMain: source.isMain,
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  return { images };
}
