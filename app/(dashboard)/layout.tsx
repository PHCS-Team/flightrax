import type { ReactNode } from "react";

import { DashboardShell } from "@/shared/components/layout/dashboard-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
