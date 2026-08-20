import type {
  FlightPlanAircraftOption,
  FlightPlanTypeOption,
} from "@/modules/flight-documents/types/aircraft-option";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchFlightPlanAircraftOptionsPage(
  page: number,
  pageSize: number,
  search: string,
  typeKey?: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search) params.set("search", search);
  if (typeKey) params.set("type", typeKey);

  const response = await fetch(
    `/api/flight-documents/aircraft-options?${params}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load aircraft."),
    );
  }

  return (await response.json()) as PaginatedResponse<FlightPlanAircraftOption>;
}

export async function fetchFlightPlanAircraft(aircraftId: string) {
  const response = await fetch(
    `/api/flight-documents/aircraft-options/${aircraftId}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load aircraft."),
    );
  }

  return (await response.json()) as FlightPlanAircraftOption | null;
}

export async function fetchFlightPlanTypeOptions() {
  const response = await fetch("/api/flight-documents/type-options", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load aircraft types."),
    );
  }

  return (await response.json()) as FlightPlanTypeOption[];
}
