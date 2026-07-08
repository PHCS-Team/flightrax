import type { ApprovedStudent } from "@/modules/students/types/student";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchApprovedStudents() {
  const response = await fetch("/api/students/approved", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load approved students."),
    );
  }

  return (await response.json()) as ApprovedStudent[];
}
