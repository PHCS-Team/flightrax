import { AircraftsClientSurface } from "@/modules/aircrafts/components/aircrafts-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function AircraftsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/aircrafts", label: "Aircrafts" },
        ]}
        title="Aircraft Management"
      />

      <AircraftsClientSurface />
    </section>
  );
}
