import { queryOptions } from "@tanstack/react-query";

import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import { fetchAircraftWeightBalance } from "@/modules/aircrafts/services/aircraft-weight-balance.client";

export function aircraftWeightBalanceQueryOptions(aircraftId: string) {
  return queryOptions({
    queryFn: () => fetchAircraftWeightBalance(aircraftId),
    queryKey: AIRCRAFTS_QUERY_KEYS.weightBalance(aircraftId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(aircraftId),
  });
}
