import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { FlightLogEntry } from "@/shared/types/flight-log";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchFlightLogsAuditPage(
  page: number,
  pageSize: number,
  search: string,
  status: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (status !== "all") {
    params.set("status", status);
  }

  const response = await fetch(
    `/api/flight-documents/flight-logs?${params}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight logs."),
    );
  }

  return (await response.json()) as PaginatedResponse<FlightLogEntry>;
}
