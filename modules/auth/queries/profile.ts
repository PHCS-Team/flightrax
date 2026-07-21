import { cache } from "react";

import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";
import {
  normalizeProfile,
  type ProfileWithRoleProfiles,
} from "@/shared/lib/rbac/profile";
import { createClient } from "@/shared/lib/supabase/server";
import type { Profile } from "@/shared/lib/rbac/types";

const PROFILE_DETAIL_SELECT =
  "*, student_profiles!student_profiles_profile_id_fkey(approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, rejection_reason, student_id_number, submitted_at), admin_profiles!admin_profiles_profile_id_fkey(department)";
const PROFILE_VIEWER_SELECT =
  "*, student_profiles!student_profiles_profile_id_fkey(approval_status), admin_profiles!admin_profiles_profile_id_fkey(department)";
const PROFILE_ACCESS_SELECT =
  "id, email, full_name, role, created_at, updated_at, license_type, license_number, rating, signature_svg, profile_photo_path, profile_photo_content_type, profile_photo_size_bytes, profile_photo_uploaded_at, student_profiles!student_profiles_profile_id_fkey(approval_status), admin_profiles!admin_profiles_profile_id_fkey(department)";

function getPublicProfilePhotoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
): string | null {
  if (!path) {
    return null;
  }

  return supabase.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toProfile(
  row: ProfileWithRoleProfiles,
  {
    supabase,
    includeProfilePhotoUrl = true,
    includeStudentDocuments = true,
  }: {
    supabase: Awaited<ReturnType<typeof createClient>>;
    includeProfilePhotoUrl?: boolean;
    includeStudentDocuments?: boolean;
  },
): Profile {
  return normalizeProfile(row, {
    includeStudentDocuments,
    profilePhotoUrl: includeProfilePhotoUrl
      ? getPublicProfilePhotoUrl(supabase, row.profile_photo_path)
      : null,
  });
}

const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getCurrentProfile = cache(async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return getProfileByUserId(user.id);
});

export const getCurrentDashboardProfile = cache(
  async function getCurrentDashboardProfile() {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    return getDashboardProfileByUserId(user.id);
  },
);

export const getProfileByUserId = cache(async function getProfileByUserId(
  userId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_DETAIL_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return toProfile(data, { supabase });
});

export const getProfileAccessByUserId = cache(
  async function getProfileAccessByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_ACCESS_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return toProfile(data, {
      supabase,
      includeProfilePhotoUrl: false,
      includeStudentDocuments: false,
    });
  },
);

const getDashboardProfileByUserId = cache(
  async function getDashboardProfileByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_VIEWER_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return toProfile(data, { supabase, includeStudentDocuments: false });
  },
);
