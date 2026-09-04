"use client";

import { useQueryClient } from "@tanstack/react-query";

import { NOTAMS_QUERY_KEYS } from "@/modules/notams/queries/query-keys";
import { useSupabaseTableChanges } from "@/shared/hooks/use-supabase-table-changes";

// Another Safety admin's post or deletion appears in the list without a
// refresh. The table is in the supabase_realtime publication (see the
// enable_realtime_notams migration); events only trigger invalidation —
// the list refetches through the normal query flow.
export function useNotamsRealtime() {
  const queryClient = useQueryClient();

  useSupabaseTableChanges({
    channelName: "notams-changes",
    tables: ["notams"],
    onChange: () => {
      queryClient.invalidateQueries({ queryKey: NOTAMS_QUERY_KEYS.all });
    },
  });
}
