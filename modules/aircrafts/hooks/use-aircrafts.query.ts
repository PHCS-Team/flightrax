"use client";

import { useQuery } from "@tanstack/react-query";

import { aircraftsQueryOptions } from "@/modules/aircrafts/queries/aircrafts";

export function useAircrafts(page: number, pageSize: number, search: string, typeFilter?: string) {
  const query = useQuery(aircraftsQueryOptions(page, pageSize, search, typeFilter));

  return {
    aircrafts: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    error: query.error,
    isPending: query.isPending,
  };
}
