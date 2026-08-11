import "server-only";

import { cache } from "react";

import type { License, LicenseImageUrls } from "@/shared/types/license";
import { LICENSE_IMAGES_BUCKET } from "@/shared/lib/storage/buckets";
import { createClient } from "@/shared/lib/supabase/server";

const LICENSE_IMAGE_URL_EXPIRY_SECONDS = 60 * 60;

const OWN_LICENSE_SELECT =
  "id, user_id, license_type, license_number, ratings, has_no_expiry, expiry_date, status, id_front_path, id_front_content_type, id_front_size_bytes, id_front_uploaded_at, id_back_path, id_back_content_type, id_back_size_bytes, id_back_uploaded_at, created_at, updated_at";

export const getOwnLicenses = cache(async function getOwnLicenses(): Promise<
  License[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("licenses")
    .select(OWN_LICENSE_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
});

export async function getLicenseImageSignedUrls(
  licenseId: string,
): Promise<LicenseImageUrls | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licenses")
    .select("id_front_path, id_back_path")
    .eq("id", licenseId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const urls: LicenseImageUrls = { frontUrl: null, backUrl: null };

  if (data.id_front_path) {
    const { data: front } = await supabase.storage
      .from(LICENSE_IMAGES_BUCKET)
      .createSignedUrl(data.id_front_path, LICENSE_IMAGE_URL_EXPIRY_SECONDS);
    urls.frontUrl = front?.signedUrl ?? null;
  }

  if (data.id_back_path) {
    const { data: back } = await supabase.storage
      .from(LICENSE_IMAGES_BUCKET)
      .createSignedUrl(data.id_back_path, LICENSE_IMAGE_URL_EXPIRY_SECONDS);
    urls.backUrl = back?.signedUrl ?? null;
  }

  return urls;
}
