"use client";

import { useQuery } from "@tanstack/react-query";

import {
  scheduleOverviewQueryOptions,
  scheduleTableQueryOptions,
} from "@/modules/schedule/queries/schedule";
import type { ScheduleDaySummary } from "@/modules/schedule/types/schedule";

const EMPTY_SUMMARY: ScheduleDaySummary = {
  flights: 0,
  pendingFlights: 0,
  unavailableInstructors: 0,
  maintenanceAircraft: 0,
};

export function useScheduleOverview(monthKey: string, enabled: boolean) {
  return useQuery(scheduleOverviewQueryOptions(monthKey, enabled));
}

export function useScheduleForDate(monthKey: string, date: string) {
  const { data, ...query } = useScheduleOverview(monthKey, true);

  const entries = (data ?? []).filter((entry) => {
    const days = entry.startsOn ? entry.startsOn.split("T")[0] : "";
    return days === date;
  });

  return {
    ...query,
    entries,
  };
}

export function useScheduleTable(
  monthKey: string,
  date: string | null,
  page: number,
  pageSize: number,
) {
  const query = useQuery(
    scheduleTableQueryOptions(monthKey, date, page, pageSize),
  );

  return {
    ...query,
    entries: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    summary: query.data?.summary ?? EMPTY_SUMMARY,
  };
}