"use client";

import { ScheduleLegendAction } from "@/modules/schedule/components/schedule-legend-action";
import { SchedulePingAction } from "@/modules/schedule/components/schedule-ping-action";
import { ScheduleUploadAction } from "@/modules/schedule/components/schedule-upload-action";
import { useScheduleView } from "@/modules/schedule/hooks/use-schedule-view";

export function ScheduleHeaderAction({ canManage }: { canManage: boolean }) {
  const [view] = useScheduleView();

  if (view === "files") {
    return canManage ? <ScheduleUploadAction /> : null;
  }

  return (
    <div className="flex items-center gap-2">
      <ScheduleLegendAction className="xl:hidden" />
      {canManage && <SchedulePingAction />}
    </div>
  );
}
