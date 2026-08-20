import { FlightDocumentsClientSurface } from "@/modules/flight-documents/components/flight-documents-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightDocumentsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
        ]}
        title="Flight Documents"
      />

      <FlightDocumentsClientSurface />
    </section>
  );
}
