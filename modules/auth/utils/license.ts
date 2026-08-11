import type { SupabaseClient } from "@supabase/supabase-js";

import { LICENSE_IMAGES_BUCKET } from "@/shared/lib/storage/buckets";
import { getImageStoragePath } from "@/shared/lib/storage/image-path";
import type { Database } from "@/shared/types/supabase";

export const LICENSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const LICENSE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type LicenseImageSide = "front" | "back";

export type LicenseImageMetadata = {
  path: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
};

export function getLicenseImagePath(
  userId: string,
  contentType: string,
  side: LicenseImageSide,
) {
  return getImageStoragePath({
    contentType,
    folder: side === "front" ? "license-front" : "license-back",
    userId,
  });
}

export async function uploadLicenseImage(
  supabase: SupabaseClient<Database>,
  userId: string,
  side: LicenseImageSide,
  file: File,
): Promise<LicenseImageMetadata | null> {
  const path = getLicenseImagePath(userId, file.type, side);
  const { error } = await supabase.storage
    .from(LICENSE_IMAGES_BUCKET)
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

export async function removeLicenseImages(
  supabase: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
) {
  const existing = paths.filter((path): path is string => Boolean(path));

  if (existing.length === 0) {
    return;
  }

  await supabase.storage.from(LICENSE_IMAGES_BUCKET).remove(existing);
}
