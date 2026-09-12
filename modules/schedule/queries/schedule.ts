import { queryOptions } from "@tanstack/react-query";

import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import {
  fetchScheduleOverview,
  fetchSchedulePage,
} from "@/modules/schedule/services/schedule.client";

export { SCHEDULE_QUERY_KEYS };

export function scheduleOverviewQueryOptions(monthKey: string, enabled: boolean) {
  return queryOptions({
    queryFn: () => fetchScheduleOverview(monthKey),
    queryKey: SCHEDULE_QUERY_KEYS.overview(monthKey),
    staleTime: 30 * 1000,
    enabled,
  });
}

export function scheduleTableQueryOptions(
  monthKey: string,
  date: string | null,
  page: number,
  pageSize: number,
) {
  return queryOptions({
    queryFn: () => fetchSchedulePage(monthKey, date, page, pageSize),
    queryKey: SCHEDULE_QUERY_KEYS.list(monthKey, date, page, pageSize),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
}