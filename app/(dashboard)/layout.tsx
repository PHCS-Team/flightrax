import type { ReactNode } from "react";

import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";

export default async function Layout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
