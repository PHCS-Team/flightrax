"use client";

import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

interface InstructorAvailabilityDetail {
  type: string;
  registry: string;
  time: string;
  legend: string;
  status: string;
}

export function AdminInstructorDetail({
  entry,
}: {
  entry: InstructorAvailabilityDetail;
}) {
  const isUnavailable = entry.status === "unavailable";

  return (
    <GlassSurface className="p-4 sm:p-6 rounded-2xl border border-primary-foreground/15">
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 sm:px-0 sm:py-0">
        <div className="w-full sm:w-1/2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-primary-foreground/60",
                isUnavailable && "text-black",
                "text-xs font-medium uppercase tracking-wider",
              )}>
                {entry.type}
              </span>
              <span className={cn(
                "font-medium text-primary-foreground",
                isUnavailable && "text-black",
              )}>
                {entry.registry}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/60">
              <span className={cn("rounded-full bg-primary-foreground/15 px-2 py-1", isUnavailable && "bg-primary-foreground/5")}>
                {entry.legend}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 flex items-center justify-center sm:pt-6">
          <div className="text-center">
            <span className={cn(
              "text-primary-foreground/60",
              isUnavailable && "text-black",
              "font-medium",
            )}>
              6:00 - 18:00
            </span>
            <p className={cn("mt-1 text-sm", isUnavailable && "text-black")}>
              Operating Hours
            </p>
          </div>
        </div>
      </div>
    </GlassSurface>
  );
}