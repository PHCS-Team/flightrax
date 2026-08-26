import type {
  FlightRequestListItem,
  FlightRequestReviewListItem,
  FlightRequestReviewScope,
  FlightRequestStatus,
} from "@/modules/flight-documents/types/flight-request";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchOwnFlightRequestsPage(
  page: number,
  pageSize: number,
  status: FlightRequestStatus,
  search: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status,
  });

  if (search) params.set("search", search);

  const response = await fetch(`/api/flight-documents/requests?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight plans."),
    );
  }

  return (await response.json()) as PaginatedResponse<FlightRequestListItem>;
}

export async function fetchReviewFlightRequestsPage(
  page: number,
  pageSize: number,
  scope: FlightRequestReviewScope,
  search: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    scope,
  });

  if (search) params.set("search", search);

  const response = await fetch(
    `/api/flight-documents/review-requests?${params}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight requests."),
    );
  }

  return (await response.json()) as PaginatedResponse<FlightRequestReviewListItem>;
}
