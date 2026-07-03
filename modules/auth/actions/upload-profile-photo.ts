"use server";

import { profilePhotoSchema } from "@/modules/auth/schemas/profile-photo-schema";
import { getProfilePhotoPath } from "@/modules/auth/utils/profile-photo";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";

export const uploadProfilePhotoAction = actionClient
  .inputSchema(profilePhotoSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before updating your profile photo." };
    }

    const adminSupabase = createAdminClient();
    const { data: currentProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("profile_photo_path")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return { ok: false, message: profileError.message };
    }

    const newPath = getProfilePhotoPath(user.id, parsedInput.profilePhoto.type);
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PHOTO_BUCKET)
      .upload(newPath, parsedInput.profilePhoto, {
        contentType: parsedInput.profilePhoto.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    const uploadedAt = new Date().toISOString();
    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({
        profile_photo_path: newPath,
        profile_photo_content_type: parsedInput.profilePhoto.type,
        profile_photo_size_bytes: parsedInput.profilePhoto.size,
        profile_photo_uploaded_at: uploadedAt,
      })
      .eq("id", user.id);

    if (updateError) {
      await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([newPath]);

      return { ok: false, message: updateError.message };
    }

    const oldPath = currentProfile?.profile_photo_path;

    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([oldPath]);
    }

    return { ok: true, message: "Profile photo updated." };
  });

export const removeProfilePhotoAction = actionClient.action(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Sign in before removing your profile photo." };
  }

  const adminSupabase = createAdminClient();
  const { data: currentProfile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("profile_photo_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  const oldPath = currentProfile?.profile_photo_path;

  if (!oldPath) {
    return { ok: true, message: "No profile photo to remove." };
  }

  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update({
      profile_photo_path: null,
      profile_photo_content_type: null,
      profile_photo_size_bytes: null,
      profile_photo_uploaded_at: null,
    })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([oldPath]);

  return { ok: true, message: "Profile photo removed." };
});
