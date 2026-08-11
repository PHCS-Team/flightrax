import type { PaginatedResponse } from "@/shared/types/pagination";
import type { ApprovedInstructor } from "@/modules/instructors/types/instructor";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchApprovedInstructorsPage(
  page: number,
  pageSize: number,
  search: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set("search", search);

  const response = await fetch(`/api/instructors/approved?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load instructors."),
    );
  }

  return (await response.json()) as PaginatedResponse<ApprovedInstructor>;
}
