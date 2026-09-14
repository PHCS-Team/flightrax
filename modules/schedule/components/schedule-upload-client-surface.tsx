"use client";

import { FileSpreadsheetIcon } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { ScheduleSheetGrid } from "@/modules/schedule/components/schedule-sheet-grid";
import { useScheduleUpload } from "@/modules/schedule/hooks/use-schedule-upload.query";
import { formatDateLabel } from "@/modules/schedule/utils/schedule-time";
import {
  formatUploadRange,
  uploadDisplayName,
} from "@/modules/schedule/utils/schedule-upload-format";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function ScheduleUploadClientSurface({
  uploadId,
}: {
  uploadId: string;
}) {
  const [date] = useQueryState("date", parseAsString.withDefault(""));
  const [pickedSheet, setPickedSheet] = useState<string | null>(null);
  const upload = useScheduleUpload(uploadId);

  if (upload.isPending) {
    return <LoadingScreen />;
  }

  if (upload.error) {
    return (
      <EmptyState
        action={
          <Button asChild variant="outline">
            <Link href="/schedule?view=files">Back to schedule files</Link>
          </Button>
        }
        description={upload.error.message}
        icon={<FileSpreadsheetIcon className="size-7" />}
        title="Schedule file could not be loaded"
      />
    );
  }

  const sheets = upload.data.sheets;
  const dateSheet = sheets.find((sheet) => sheet.boardDate === date);
  const activeSheetId =
    pickedSheet && sheets.some((sheet) => sheet.id === pickedSheet)
      ? pickedSheet
      : (dateSheet?.id ?? sheets[0]?.id ?? null);
  const activeSheet = sheets.find((sheet) => sheet.id === activeSheetId);

  return (
    <div className="sm:space-y-4">
      <div className="px-2.5 pt-2.5 pb-3 sm:px-0 sm:py-0">
        <p className="truncate text-base font-semibold text-primary-foreground">
          {uploadDisplayName(upload.data)}
        </p>
        <p className="truncate text-xs text-primary-foreground/70">
          Covers {formatUploadRange(upload.data.startsOn, upload.data.endsOn)}
          {upload.data.uploadedByName
            ? ` · Uploaded by ${upload.data.uploadedByName}`
            : ""}
        </p>
      </div>

      {sheets.length > 1 && activeSheetId && (
        <Tabs onValueChange={setPickedSheet} value={activeSheetId}>
          <TabsList className="w-full justify-start overflow-x-auto border-x-0 border-y border-primary-foreground/15 p-1.5 md:w-fit md:max-w-full md:border-x">
            {sheets.map((sheet) => (
              <TabsTrigger className="flex-none" key={sheet.id} value={sheet.id}>
                {sheet.boardDate
                  ? formatDateLabel(sheet.boardDate, "EEE d")
                  : sheet.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {activeSheet ? (
        <ScheduleSheetGrid grid={activeSheet.grid} key={activeSheet.id} />
      ) : (
        <EmptyState
          description="The workbook was uploaded but none of its sheets had anything on them."
          icon={<FileSpreadsheetIcon className="size-7" />}
          title="Nothing To Show"
        />
      )}
    </div>
  );
}
