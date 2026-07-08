import "server-only";

import { cache } from "react";

import { normalizeProfile } from "@/shared/lib/rbac/profile";
import type { Profile } from "@/shared/lib/rbac/types";
import { createClient } from "@/shared/lib/supabase/server";

const AUTHORIZATION_PROFILE_SELECT =
  "*, student_profiles!student_profiles_profile_id_fkey(approval_status), admin_profiles!admin_profiles_profile_id_fkey(department)";

const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getAuthorizationProfileByUserId = cache(
  async function getAuthorizationProfileByUserId(
    userId: string,
  ): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(AUTHORIZATION_PROFILE_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return normalizeProfile(data, {
      includeStudentDocuments: false,
      profilePhotoUrl: null,
    });
  },
);

export const getCurrentAuthorizationProfile = cache(
  async function getCurrentAuthorizationProfile() {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    return getAuthorizationProfileByUserId(user.id);
  },
);
