import type { AircraftWeightBalance } from "@/modules/aircrafts/types/aircraft-weight-balance";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAircraftWeightBalance(aircraftId: string) {
  const response = await fetch(
    `/api/aircrafts/${aircraftId}/weight-balance`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load weight and balance."),
    );
  }

  const data: AircraftWeightBalance | null = await response.json();

  return data;
}
