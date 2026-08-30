import type { PaginatedResponse } from "@/shared/types/pagination";
import type { Notam } from "@/modules/notams/types/notam";

type SeverityFilter = "" | "advisory" | "warning" | "alert";

export async function fetchNotamsPage(
  page: number,
  pageSize: number,
  search: string,
  severity: SeverityFilter,
  expiry: string,
): Promise<PaginatedResponse<Notam>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    search,
    severity,
    expiry,
  });

  const response = await fetch(`/api/notams?${params}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch NOTAMs" }));
    throw new Error(error.message ?? "Failed to fetch NOTAMs");
  }

  return response.json();
}