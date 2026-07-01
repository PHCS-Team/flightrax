import { getImageStoragePath } from "@/shared/lib/storage/image-path";

export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_ID_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const STUDENT_ID_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getStudentIdDocumentPath(userId: string, contentType: string) {
  return getImageStoragePath({ contentType, folder: "student-id", userId });
}
