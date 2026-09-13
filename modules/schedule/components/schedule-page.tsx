import { ScheduleClientSurface } from "@/modules/schedule/components/schedule-client-surface";
import { ScheduleLegendAction } from "@/modules/schedule/components/schedule-legend-action";
import { PageHeader } from "@/shared/components/layout/page-header";

export function SchedulePage({ canManage }: { canManage: boolean }) {
  return (
    <section>
      <PageHeader
        action={<ScheduleLegendAction />}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Schedule" },
        ]}
        title="Flight Schedule"
      />

      <ScheduleClientSurface canManage={canManage} />
    </section>
  );
}
