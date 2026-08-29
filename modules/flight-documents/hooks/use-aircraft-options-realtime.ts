"use client";

import { useQueryClient } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

// While the aircraft picker is open, refetch the options list whenever an
// admin changes anything availability depends on — type W&B specs, basic
// empty weight configs, or aircraft status. Each table is in the
// supabase_realtime publication (see the
// enable_realtime_aircraft_availability migration).
export function useAircraftOptionsRealtime({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "flight-plan-aircraft-availability",
    enabled,
    tables: ["aircrafts", "aircraft_types", "aircraft_weight_balance_configs"],
    onChange: () => {
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.aircraftOptionsAll,
      });
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.typeOptions,
      });
    },
  });
}
