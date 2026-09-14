import { ScheduleHeaderAction } from "@/modules/schedule/components/schedule-header-action";
import { ScheduleViewSwitch } from "@/modules/schedule/components/schedule-view-switch";
import { PageHeader } from "@/shared/components/layout/page-header";

export function SchedulePage({ canManage }: { canManage: boolean }) {
  return (
    <section>
      <PageHeader
        action={<ScheduleHeaderAction canManage={canManage} />}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Schedule" },
        ]}
        title="Flight Schedule"
      />

      <ScheduleViewSwitch canManage={canManage} />
    </section>
  );
}
