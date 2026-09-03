import { FlightLogClientSurface } from "@/modules/flight-documents/components/flight-log-client-surface";
import { DownloadFlightDocumentsAction } from "@/shared/components/layout/download-flight-documents-action";
import { PageHeader } from "@/shared/components/layout/page-header";

export function FlightLogPage({
  context = "account",
  flightPlanId,
}: {
  context?: "account" | "flight-plans";
  flightPlanId: string;
}) {
  const breadcrumbs =
    context === "flight-plans"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-plans", label: "Flight Plans" },
          { href: `/flight-plans/${flightPlanId}`, label: "Flight Log" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/account", label: "Account" },
          {
            href: `/flight-documents/flight-plans/${flightPlanId}/log`,
            label: "Flight Log",
          },
        ];

  return (
    <section>
      <PageHeader
        action={<DownloadFlightDocumentsAction />}
        breadcrumbs={breadcrumbs}
        title="Flight Log"
      />

      <FlightLogClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
