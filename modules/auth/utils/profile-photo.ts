import { getImageStoragePath } from "@/shared/lib/storage/image-path";

export const PROFILE_PHOTO_BUCKET = "profile-photos";
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getProfilePhotoPath(userId: string, contentType: string) {
  return getImageStoragePath({ contentType, folder: "avatar", userId });
}
