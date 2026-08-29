"use client";

import { useQueryClient } from "@tanstack/react-query";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

// Refreshes flight request data the moment any request changes: a
// submission pops into the PIC's review queue, and an approval or
// rejection reaches the owner's lists and open detail pages — no
// refresh needed. flight_requests is in the supabase_realtime
// publication (see the enable_realtime_flight_requests migration).
export function useFlightRequestsRealtime() {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "flight-requests-changes",
    tables: ["flight_requests"],
    onChange: (payload) => {
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.requestsAll,
      });
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.reviewRequestsAll,
      });

      const row = (payload?.new ?? payload?.old) as
        | { flight_plan_id?: string }
        | undefined;

      if (row?.flight_plan_id) {
        queryClient.invalidateQueries({
          queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.flightPlan(row.flight_plan_id),
        });
        queryClient.invalidateQueries({
          queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.weightBalance(
            row.flight_plan_id,
          ),
        });
      }
    },
  });
}
