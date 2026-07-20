import type { PaginatedResponse } from "@/shared/types/pagination";
import type { ApprovedStudent } from "@/modules/students/types/student";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchApprovedStudentsPage(
  page: number,
  pageSize: number,
  search: string,
) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);

  const response = await fetch(`/api/students/approved?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load approved students."),
    );
  }

  return (await response.json()) as PaginatedResponse<ApprovedStudent>;
}
