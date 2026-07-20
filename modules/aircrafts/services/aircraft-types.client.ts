import type { AircraftType } from "@/modules/aircrafts/types/aircraft-type";
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
