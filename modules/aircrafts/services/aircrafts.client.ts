import type { Aircraft } from "@/modules/aircrafts/types/aircraft";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAircraftsPage(
  page: number,
  pageSize: number,
  search: string,
  typeFilter?: string,
) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);
  if (typeFilter) params.set("type", typeFilter);

  const response = await fetch(`/api/aircrafts?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Unable to load aircraft."));
  }

  return (await response.json()) as PaginatedResponse<Aircraft>;
}
