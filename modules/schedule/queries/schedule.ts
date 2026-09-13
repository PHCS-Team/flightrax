import { queryOptions } from "@tanstack/react-query";

import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import {
  fetchScheduleDay,
  fetchSchedulePeople,
} from "@/modules/schedule/services/schedule.client";

export { SCHEDULE_QUERY_KEYS };

export function scheduleDayQueryOptions(date: string) {
  return queryOptions({
    queryKey: SCHEDULE_QUERY_KEYS.day(date),
    queryFn: () => fetchScheduleDay(date),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

export function schedulePeopleQueryOptions() {
  return queryOptions({
    queryKey: SCHEDULE_QUERY_KEYS.people,
    queryFn: fetchSchedulePeople,
    staleTime: 5 * 60 * 1000,
  });
}
