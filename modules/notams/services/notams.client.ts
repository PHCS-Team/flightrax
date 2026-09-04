import type {
  Notam,
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchNotamsPage(
  page: number,
  pageSize: number,
  search: string,
  status: NotamStatusFilter,
  severity: NotamSeverityFilter,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (severity !== "all") {
    params.set("severity", severity);
  }

  const response = await fetch(`/api/notams?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load NOTAMs."),
    );
  }

  return (await response.json()) as PaginatedResponse<Notam>;
}
