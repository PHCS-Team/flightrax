import { ScheduleClientSurface } from "@/modules/schedule/components/schedule-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function SchedulePage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Schedule" },
        ]}
        title="Flight Schedule"
      />

      <ScheduleClientSurface />
    </section>
  );
}