import type { ReactNode } from "react";

import { LiveClock } from "@/modules/dashboard/components/live-clock";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightOperationsHome({ children }: { children: ReactNode }) {
  return (
    <section>
      <PageHeader
        action={<LiveClock />}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }]}
        title="Home"
      />

      {children}
    </section>
  );
}
