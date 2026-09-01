import { FlightLogClientSurface } from "@/modules/flight-documents/components/flight-log-client-surface";
import { DownloadFlightDocumentsAction } from "@/shared/components/layout/download-flight-documents-action";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightLogPage({ flightPlanId }: { flightPlanId: string }) {
  return (
    <section>
      <PageHeader
        action={<DownloadFlightDocumentsAction />}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/account", label: "Account" },
          {
            href: `/flight-documents/flight-plans/${flightPlanId}/log`,
            label: "Flight Log",
          },
        ]}
        title="Flight Log"
      />

      <FlightLogClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
