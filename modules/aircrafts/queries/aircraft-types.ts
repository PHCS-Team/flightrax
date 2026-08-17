import { queryOptions } from "@tanstack/react-query";

import { AIRCRAFTS_QUERY_KEYS } from "@/modules/aircrafts/queries/query-keys";
import {
  fetchAircraftTypeBaggageAreas,
  fetchAircraftTypes,
} from "@/modules/aircrafts/services/aircraft-types.client";

export function aircraftTypesQueryOptions() {
  return queryOptions({
    queryFn: fetchAircraftTypes,
    queryKey: AIRCRAFTS_QUERY_KEYS.types,
    staleTime: 10 * 60 * 1000,
  });
}

export function aircraftTypeBaggageAreasQueryOptions(typeKey: string) {
  return queryOptions({
    queryFn: () => fetchAircraftTypeBaggageAreas(typeKey),
    queryKey: AIRCRAFTS_QUERY_KEYS.typeBaggageAreas(typeKey),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(typeKey),
  });
}
