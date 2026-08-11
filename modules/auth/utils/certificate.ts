import type { SupabaseClient } from "@supabase/supabase-js";

import { CERTIFICATE_IMAGES_BUCKET } from "@/shared/lib/storage/buckets";
import { getImageStoragePath } from "@/shared/lib/storage/image-path";
import type { Database } from "@/shared/types/supabase";

export const CERTIFICATE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const CERTIFICATE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type CertificateImageMetadata = {
  path: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
};

export function getCertificateImagePath(userId: string, contentType: string) {
  return getImageStoragePath({
    contentType,
    folder: "certificate",
    userId,
  });
}

export async function uploadCertificateImage(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<CertificateImageMetadata | null> {
  const path = getCertificateImagePath(userId, file.type);
  const { error } = await supabase.storage
    .from(CERTIFICATE_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return null;
  }

  return {
    path,
    content_type: file.type,
    size_bytes: file.size,
    uploaded_at: new Date().toISOString(),
  };
}

export async function removeCertificateImages(
  supabase: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
) {
  const existing = paths.filter((path): path is string => Boolean(path));

  if (existing.length === 0) {
    return;
  }

  await supabase.storage.from(CERTIFICATE_IMAGES_BUCKET).remove(existing);
}
