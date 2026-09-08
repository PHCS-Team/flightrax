import { queryOptions } from "@tanstack/react-query";

import { MONITOR_QUERY_KEYS } from "@/modules/monitor/queries/query-keys";
import { fetchFlightMonitorBoard } from "@/modules/monitor/services/monitor.client";

// The TV has no session for realtime, so it polls: ten seconds keeps a
// commence or arrival visible within a glance, at one small request per
// tick per screen.
export const MONITOR_POLL_MS = 10 * 1000;

export function monitorBoardQueryOptions() {
  return queryOptions({
    queryFn: fetchFlightMonitorBoard,
    queryKey: MONITOR_QUERY_KEYS.board,
    refetchInterval: MONITOR_POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}
