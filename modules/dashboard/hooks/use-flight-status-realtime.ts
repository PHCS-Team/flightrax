"use client";

import { useQueryClient } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

// Live monitoring: a journey transition (commence/terminate) or an
// aircraft status change made by anyone must appear on every open board
// without a refresh. Both tables are in the supabase_realtime
// publication (see the enable_realtime_flight_journeys and
// enable_realtime_aircraft_availability migrations); events only
// trigger invalidation — the board refetches through the normal query
// flow.
export function useFlightStatusRealtime() {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "dashboard-flight-status-changes",
    tables: ["flight_journeys", "aircrafts"],
    onChange: () => {
      // Board and today's-flights drawer both derive from journeys.
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.all,
      });
    },
  });
}
