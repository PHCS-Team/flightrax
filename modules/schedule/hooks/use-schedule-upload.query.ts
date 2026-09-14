"use client";

import { useQuery } from "@tanstack/react-query";

import { scheduleUploadQueryOptions } from "@/modules/schedule/queries/schedule-uploads";

export function useScheduleUpload(id: string) {
  return useQuery(scheduleUploadQueryOptions(id));
}
