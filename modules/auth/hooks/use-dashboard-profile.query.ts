"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardProfileQueryOptions } from "@/modules/auth/queries/dashboard-profile";

export function useDashboardProfile() {
  return useQuery(dashboardProfileQueryOptions());
}
