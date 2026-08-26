import { FlightPlanEditClientSurface } from "@/modules/flight-documents/components/flight-plan-edit-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightPlanEditPage({ flightPlanId }: { flightPlanId: string }) {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
          {
            href: `/flight-documents/flight-plans/${flightPlanId}`,
            label: "Edit Flight Plan",
          },
        ]}
        title="Edit Flight Plan"
      />

      <FlightPlanEditClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
