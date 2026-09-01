import type { FlightJourneyDetails } from "@/modules/flight-documents/types/flight-request";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchFlightJourneyDetails(flightPlanId: string) {
  const response = await fetch(
    `/api/flight-documents/flight-plans/${flightPlanId}/journey`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the flight journey."),
    );
  }

  return (await response.json()) as FlightJourneyDetails | null;
}
