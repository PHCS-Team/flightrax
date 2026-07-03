import { queryOptions } from "@tanstack/react-query";

import type { Profile } from "@/shared/lib/rbac/types";

export const AUTH_QUERY_KEYS = {
  currentDashboardProfile: ["auth", "dashboard-profile"] as const,
};

export async function fetchCurrentDashboardProfile() {
  const response = await fetch("/api/auth/dashboard-profile", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to load dashboard profile.");
  }

  return (await response.json()) as Profile | null;
}

export function dashboardProfileQueryOptions() {
  return queryOptions({
    queryFn: fetchCurrentDashboardProfile,
    queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
    staleTime: 5 * 60 * 1000,
  });
}
