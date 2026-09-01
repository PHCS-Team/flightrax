import type { AccountFlightLog } from "@/modules/auth/types/flight-log";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchAccountFlightLogsPage(
  page: number,
  pageSize: number,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/auth/flight-logs?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight logs."),
    );
  }

  return (await response.json()) as PaginatedResponse<AccountFlightLog>;
}
