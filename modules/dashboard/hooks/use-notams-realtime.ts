"use client";

import { useQueryClient } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEYS } from "@/modules/dashboard/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

// A Safety admin's post or deletion reaches every open dashboard without a
// refresh. Mounted once per page by the NOTAM ticker. The table is in the
// supabase_realtime publication (see the enable_realtime_notams migration).
export function useNotamsRealtime() {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "dashboard-notams-changes",
    tables: ["notams"],
    onChange: () => {
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.activeNotams,
      });
    },
  });
}
