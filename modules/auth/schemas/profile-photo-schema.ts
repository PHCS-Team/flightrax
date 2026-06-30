import { z } from "zod";

import { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/modules/auth/utils/profile-photo";

const profilePhotoFileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Choose a profile photo.",
);

export const profilePhotoSchema = z
  .object({
    profilePhoto: profilePhotoFileSchema,
  })
  .superRefine((value, context) => {
    if (!PROFILE_PHOTO_TYPES.includes(value.profilePhoto.type as (typeof PROFILE_PHOTO_TYPES)[number])) {
      context.addIssue({
        code: "custom",
        path: ["profilePhoto"],
        message: "Upload a JPG, PNG, or WebP image.",
      });
    }

    if (value.profilePhoto.size > PROFILE_PHOTO_MAX_BYTES) {
      context.addIssue({
        code: "custom",
        path: ["profilePhoto"],
        message: "Profile photo must be 5 MB or smaller.",
      });
    }
  });
