import { FlightRequestReviewClientSurface } from "@/modules/flight-documents/components/flight-request-review-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightRequestReviewPage({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-requests", label: "Flight Requests" },
          {
            href: `/flight-requests/${flightPlanId}`,
            label: "Review Flight Request",
          },
        ]}
        title="Review Flight Request"
      />

      <FlightRequestReviewClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
