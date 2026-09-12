import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SchedulePage } from "@/modules/schedule/components/schedule-page";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import {
  getScheduleOverview,
  getSchedulePage,
} from "@/modules/schedule/services/schedule.server";
import { currentMonthKey } from "@/modules/schedule/utils/schedule-date";
import { getQueryClient } from "@/shared/lib/query-client";

const DEFAULT_PAGE_SIZE = 50;

export async function ScheduleRoute() {
  const month = currentMonthKey();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: SCHEDULE_QUERY_KEYS.overview(month),
      queryFn: () => getScheduleOverview(month),
    }),
    queryClient.prefetchQuery({
      queryKey: SCHEDULE_QUERY_KEYS.list(month, null, 1, DEFAULT_PAGE_SIZE),
      queryFn: () => getSchedulePage(month, null, 1, DEFAULT_PAGE_SIZE),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulePage />
    </HydrationBoundary>
  );
}