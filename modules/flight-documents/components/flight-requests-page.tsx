import { FlightRequestsClientSurface } from "@/modules/flight-documents/components/flight-requests-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightRequestsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-requests", label: "Flight Requests" },
        ]}
        title="Flight Requests"
      />

      <FlightRequestsClientSurface />
    </section>
  );
}
