import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { getCurrentDashboardProfile } from "@/modules/auth/queries/profile";
import { getAppSettings } from "@/shared/lib/app-settings.server";
import { APP_SETTINGS_QUERY_KEY } from "@/shared/hooks/use-app-settings.query";
import { DashboardLicenseSetupGate } from "@/modules/auth/components/dashboard-license-setup-gate";
import { DashboardPasswordGate } from "@/modules/auth/components/dashboard-password-gate";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { getQueryClient } from "@/shared/lib/query-client";

export default async function Layout({ children }: { children: ReactNode }) {
  const [profile, appSettings] = await Promise.all([
    getCurrentDashboardProfile(),
    getAppSettings(),
  ]);
  const queryClient = getQueryClient();

  queryClient.setQueryData(AUTH_QUERY_KEYS.currentDashboardProfile, profile);
  queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, appSettings);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>
        <DashboardPasswordGate />
        <DashboardLicenseSetupGate />
        {children}
      </DashboardShell>
    </HydrationBoundary>
  );
}
