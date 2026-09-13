"use client";

import { useQuery } from "@tanstack/react-query";

import { scheduleDayQueryOptions } from "@/modules/schedule/queries/schedule";

export function useScheduleDay(date: string) {
  return useQuery(scheduleDayQueryOptions(date));
}
