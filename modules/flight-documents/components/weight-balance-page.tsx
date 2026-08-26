import { WeightBalanceClientSurface } from "@/modules/flight-documents/components/weight-balance-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function WeightBalancePage({ flightPlanId }: { flightPlanId: string }) {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
          {
            href: `/flight-documents/flight-plans/${flightPlanId}/weight-balance`,
            label: "Weight & Balance",
          },
        ]}
        title="Weight & Balance"
      />

      <WeightBalanceClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
