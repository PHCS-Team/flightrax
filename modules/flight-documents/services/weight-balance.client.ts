import type { WeightBalanceContext } from "@/modules/flight-documents/types/weight-balance";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchWeightBalanceContext(flightPlanId: string) {
  const response = await fetch(
    `/api/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to load weight and balance.",
      ),
    );
  }

  return (await response.json()) as WeightBalanceContext | null;
}
