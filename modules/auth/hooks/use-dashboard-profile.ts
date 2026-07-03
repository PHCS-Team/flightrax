"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardProfileQueryOptions } from "@/modules/auth/queries/dashboard-profile-query";

export function useDashboardProfile() {
  return useQuery(dashboardProfileQueryOptions());
}
