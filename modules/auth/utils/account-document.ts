import { getImageStoragePath } from "@/shared/lib/storage/image-path";

export const ID_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ID_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getAccountIdDocumentPath(userId: string, contentType: string) {
  return getImageStoragePath({ contentType, folder: "account-id", userId });
}
