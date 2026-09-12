import { SCHEDULE_STATUS_META } from "@/modules/schedule/utils/schedule-style";
import { cn } from "@/shared/lib/utils";

export function ScheduleLegend() {
  const statuses = Object.values(SCHEDULE_STATUS_META);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {statuses.map((meta) => (
        <span
          className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/70"
          key={meta.label}
        >
          <span className={cn("size-2 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      ))}
    </div>
  );
}