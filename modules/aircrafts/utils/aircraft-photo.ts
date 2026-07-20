import { getImageStoragePath } from "@/shared/lib/storage/image-path";

export const AIRCRAFT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const AIRCRAFT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getAircraftPhotoPath(aircraftId: string, contentType: string) {
  return getImageStoragePath({
    contentType,
    folder: "aircraft-photo",
    userId: aircraftId,
  });
}
