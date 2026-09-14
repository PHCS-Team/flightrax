"use client";

import { FileSpreadsheetIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { ScheduleMonthCalendar } from "@/modules/schedule/components/schedule-month-calendar";
import { ScheduleMonthStrip } from "@/modules/schedule/components/schedule-month-strip";
import { ScheduleUploadDeleteConfirmation } from "@/modules/schedule/components/schedule-upload-delete-confirmation";
import { ScheduleUploadListItem } from "@/modules/schedule/components/schedule-upload-list-item";
import { useScheduleUploadMonth } from "@/modules/schedule/hooks/use-schedule-upload-month.query";
import type { ScheduleUpload } from "@/modules/schedule/types/schedule-upload";
import {
  isMonthString,
  operationsMonth,
} from "@/modules/schedule/utils/schedule-month";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function ScheduleUploadsClientSurface({
  canManage,
}: {
  canManage: boolean;
}) {
  const [month, setMonth] = useQueryState(
    "month",
    parseAsString.withDefault(operationsMonth()),
  );
  const activeMonth = isMonthString(month) ? month : operationsMonth();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [uploadPendingDelete, setUploadPendingDelete] =
    useState<ScheduleUpload | null>(null);
  const uploads = useScheduleUploadMonth(activeMonth);

  if (!uploads.isPending && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }

  if (uploads.isPending && !hasLoadedOnce) {
    return <LoadingScreen />;
  }

  if (uploads.error) {
    return (
      <EmptyState
        description={uploads.error.message}
        icon={<FileSpreadsheetIcon className="size-7" />}
        title="Schedule files could not be loaded"
      />
    );
  }

  const list = uploads.data ?? [];

  return (
    <TooltipProvider>
      <div className="sm:space-y-4">
        <div className="px-2.5 pt-2.5 pb-3 sm:px-0 sm:py-0">
          <ScheduleMonthStrip month={activeMonth} onChange={setMonth} />
        </div>

        {uploads.isPending || !uploads.data ? (
          <LoadingScreen variant="section" />
        ) : (
          <>
            <ScheduleMonthCalendar
              isRefreshing={uploads.isPlaceholderData}
              month={activeMonth}
              uploads={list}
            />

            <GlassSurface className="mt-3 overflow-hidden sm:mt-0">
              <p className="border-b border-primary-foreground/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground/70 sm:px-5 sm:py-2.5 sm:text-[11px]">
                Files This Month
              </p>
              {list.length === 0 ? (
                <p className="px-4 py-4 text-sm text-primary-foreground/70 sm:px-5">
                  {canManage
                    ? "No file covers this month yet. Upload the Excel schedule and set the days it covers."
                    : "No schedule file covers this month yet. Check back later."}
                </p>
              ) : (
                list.map((upload, index) => (
                  <ScheduleUploadListItem
                    chipIndex={index}
                    key={upload.id}
                    onDelete={canManage ? setUploadPendingDelete : undefined}
                    upload={upload}
                  />
                ))
              )}
            </GlassSurface>
          </>
        )}
      </div>

      {canManage && (
        <ScheduleUploadDeleteConfirmation
          onOpenChange={(open) => {
            if (!open) setUploadPendingDelete(null);
          }}
          open={Boolean(uploadPendingDelete)}
          upload={uploadPendingDelete}
        />
      )}
    </TooltipProvider>
  );
}
