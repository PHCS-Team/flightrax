import type { TodaysFlightRow } from "@/modules/dashboard/types/todays-flight";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchTodaysFlightsPage(
  page: number,
  pageSize: number,
  search: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`/api/dashboard/todays-flights?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load today's flights."),
    );
  }

  return (await response.json()) as PaginatedResponse<TodaysFlightRow>;
}
