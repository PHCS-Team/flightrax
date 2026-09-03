import { FlightPlansAuditClientSurface } from "@/modules/flight-documents/components/flight-plans-audit-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightPlansAuditPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-plans", label: "Flight Plans" },
        ]}
        title="Flight Plans"
      />

      <FlightPlansAuditClientSurface />
    </section>
  );
}
