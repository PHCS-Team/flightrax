export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_ID_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const STUDENT_ID_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getStudentIdDocumentExtension(contentType: string) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function getStudentIdDocumentPath(userId: string, contentType: string) {
  const extension = getStudentIdDocumentExtension(contentType);

  return `${userId}/student-id/${crypto.randomUUID()}.${extension}`;
}
