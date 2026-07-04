import type { StudentReviewItem } from "@/modules/students/types/student-review";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchStudentReviewItems() {
  const response = await fetch("/api/auth/student-review", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to load student review requests.",
      ),
    );
  }

  return (await response.json()) as StudentReviewItem[];
}
