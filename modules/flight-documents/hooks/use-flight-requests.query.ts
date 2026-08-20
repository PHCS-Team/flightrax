"use client";

import { useQuery } from "@tanstack/react-query";

import { ownFlightRequestsQueryOptions } from "@/modules/flight-documents/queries/flight-requests";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";

export function useOwnFlightRequests(
  page: number,
  pageSize: number,
  status: FlightRequestStatus,
) {
  const query = useQuery(ownFlightRequestsQueryOptions(page, pageSize, status));

  return {
    requests: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    error: query.error,
    isPending: query.isPending,
  };
}
