"use client";

import { useQuery } from "@tanstack/react-query";

import { monitorBoardQueryOptions } from "@/modules/monitor/queries/monitor";

export function useMonitorBoard() {
  const query = useQuery(monitorBoardQueryOptions());

  return {
    board: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
}
