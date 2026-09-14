import { queryOptions } from "@tanstack/react-query";

import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import {
  fetchScheduleUpload,
  fetchScheduleUploadMonth,
} from "@/modules/schedule/services/schedule-uploads.client";

export function scheduleUploadMonthQueryOptions(month: string) {
  return queryOptions({
    queryKey: SCHEDULE_QUERY_KEYS.uploadMonth(month),
    queryFn: () => fetchScheduleUploadMonth(month),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
}

export function scheduleUploadQueryOptions(id: string) {
  return queryOptions({
    queryKey: SCHEDULE_QUERY_KEYS.upload(id),
    queryFn: () => fetchScheduleUpload(id),
    staleTime: 5 * 60 * 1000,
  });
}
