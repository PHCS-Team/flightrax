"use client";

import { useQuery } from "@tanstack/react-query";

import { licensesQueryOptions } from "@/modules/auth/queries/licenses";

export function useLicenses() {
  return useQuery(licensesQueryOptions());
}
