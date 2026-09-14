"use client";

import { useQuery } from "@tanstack/react-query";

import { scheduleUploadMonthQueryOptions } from "@/modules/schedule/queries/schedule-uploads";

export function useScheduleUploadMonth(month: string) {
  return useQuery(scheduleUploadMonthQueryOptions(month));
}
