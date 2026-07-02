import type { ReactNode } from "react";

import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { DashboardLicenseSetupGate } from "@/modules/auth/components/dashboard-license-setup-gate";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";

export default async function Layout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <DashboardShell profile={profile}>
      <DashboardLicenseSetupGate profile={profile} />
      {children}
    </DashboardShell>
  );
}
