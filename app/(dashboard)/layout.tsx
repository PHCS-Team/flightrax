import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile-query";
import { getCurrentDashboardProfile } from "@/modules/auth/queries/profile";
import { DashboardLicenseSetupGate } from "@/modules/auth/components/dashboard-license-setup-gate";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { getQueryClient } from "@/shared/lib/query-client";

export default async function Layout({ children }: { children: ReactNode }) {
  const profile = await getCurrentDashboardProfile();
  const queryClient = getQueryClient();

  queryClient.setQueryData(AUTH_QUERY_KEYS.currentDashboardProfile, profile);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>
        <DashboardLicenseSetupGate />
        {children}
      </DashboardShell>
    </HydrationBoundary>
  );
}
