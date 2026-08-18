import type {
  AircraftType,
  AircraftTypeBaggageArea,
} from "@/modules/aircrafts/types/aircraft-type";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAircraftTypes() {
  const response = await fetch("/api/aircraft-types", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load aircraft types."),
    );
  }

  return (await response.json()) as AircraftType[];
}

export async function fetchAircraftTypeBaggageAreas(typeKey: string) {
  const response = await fetch(
    `/api/aircraft-types/${encodeURIComponent(typeKey)}/baggage-areas`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load baggage areas."),
    );
  }

  return (await response.json()) as AircraftTypeBaggageArea[];
}
