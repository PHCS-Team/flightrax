"use client";

import { useQuery } from "@tanstack/react-query";

import { activeNotamsQueryOptions } from "@/modules/dashboard/queries/active-notams";

export function useActiveNotams() {
  const query = useQuery(activeNotamsQueryOptions());

  return {
    ...query,
    notams: query.data ?? [],
  };
}
