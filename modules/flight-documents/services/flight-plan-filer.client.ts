import type {
  FlightPlanFilerContext,
  FlightPlanPicOption,
} from "@/modules/flight-documents/types/filer-context";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchFlightPlanFilerContext() {
  const response = await fetch("/api/flight-documents/filer-context", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load your profile."),
    );
  }

  return (await response.json()) as FlightPlanFilerContext;
}

export async function fetchFlightPlanPicOptions() {
  const response = await fetch("/api/flight-documents/pic-options", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load instructors."),
    );
  }

  return (await response.json()) as FlightPlanPicOption[];
}
