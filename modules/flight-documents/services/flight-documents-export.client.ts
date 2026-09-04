import type { FlightDocumentsExport } from "@/modules/flight-documents/types/flight-documents-export";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchFlightDocumentsExport(flightPlanId: string) {
  const response = await fetch(
    `/api/flight-documents/flight-plans/${flightPlanId}/export`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load flight documents."),
    );
  }

  return (await response.json()) as FlightDocumentsExport;
}
