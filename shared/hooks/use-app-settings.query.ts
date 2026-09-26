"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { DEFAULT_APP_SETTINGS, type AppSettings } from "@/shared/lib/app-settings";

export const APP_SETTINGS_QUERY_KEY = ["app-settings"] as const;

async function fetchAppSettings(): Promise<AppSettings> {
  const response = await fetch("/api/app-settings", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to load app settings.");
  }

  return (await response.json()) as AppSettings;
}

export function appSettingsQueryOptions() {
  return queryOptions({
    queryFn: fetchAppSettings,
    queryKey: APP_SETTINGS_QUERY_KEY,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppSettings() {
  const { data = DEFAULT_APP_SETTINGS } = useQuery(appSettingsQueryOptions());

  return data;
}
