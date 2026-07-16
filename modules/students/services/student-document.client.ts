import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchStudentDocumentUrl(studentId: string) {
  const response = await fetch(
    `/api/students/student-review/${studentId}/document`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load document preview."),
    );
  }

  const { documentUrl } = (await response.json()) as { documentUrl: string };

  return documentUrl;
}
