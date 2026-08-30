import type { DashboardFlightStatusRow } from "@/modules/dashboard/types/flight-status";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchDashboardFlightStatusPage(
  page: number,
  pageSize: number,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/dashboard/flight-status?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight status."),
    );
  }

  return (await response.json()) as PaginatedResponse<DashboardFlightStatusRow>;
}
