import { FlightPlanCreateClientSurface } from "@/modules/flight-documents/components/flight-plan-create-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightPlanCreatePage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
          {
            href: "/flight-documents/flight-plans/new",
            label: "File Flight Plan",
          },
        ]}
        title="File Flight Plan"
      />

      <FlightPlanCreateClientSurface />
    </section>
  );
}
