import type { FlightPlanForEdit } from "@/modules/flight-documents/types/flight-plan";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchOwnFlightPlanForEdit(flightPlanId: string) {
  const response = await fetch(
    `/api/flight-documents/flight-plans/${flightPlanId}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight plan."),
    );
  }

  return (await response.json()) as FlightPlanForEdit | null;
}
