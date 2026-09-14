"use client";

import { format } from "date-fns";
import { FileSpreadsheetIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import type { ScheduleUpload } from "@/modules/schedule/types/schedule-upload";
import {
  formatFileSize,
  formatUploadRange,
  uploadChipClass,
  uploadDisplayName,
} from "@/modules/schedule/utils/schedule-upload-format";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export function ScheduleUploadListItem({
  chipIndex,
  onDelete,
  upload,
}: {
  chipIndex: number;
  onDelete?: (upload: ScheduleUpload) => void;
  upload: ScheduleUpload;
}) {
  const sheets =
    upload.sheetCount === 1 ? "1 sheet" : `${upload.sheetCount} sheets`;

  return (
    <article className="flex items-center gap-3 border-b border-primary-foreground/10 px-4 py-3 last:border-b-0 sm:px-5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          uploadChipClass(chipIndex),
        )}
      >
        <FileSpreadsheetIcon className="size-4" />
      </span>
      <Link
        className="min-w-0 flex-1 cursor-pointer rounded-lg focus-visible:outline-1 focus-visible:outline-ring"
        href={`/schedule/uploads/${upload.id}`}
      >
        <p className="truncate text-sm font-semibold text-primary-foreground">
          {uploadDisplayName(upload)}
        </p>
        <p className="truncate text-xs text-primary-foreground/70">
          {formatUploadRange(upload.startsOn, upload.endsOn)} · {sheets} ·{" "}
          {formatFileSize(upload.sizeBytes)}
        </p>
        <p className="truncate text-xs text-primary-foreground/55">
          {upload.uploadedByName ? `${upload.uploadedByName} · ` : ""}
          {format(new Date(upload.createdAt), "MMM d, h:mm a")}
        </p>
      </Link>
      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Remove file"
              className="shrink-0 cursor-pointer text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => onDelete(upload)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove File</p>
          </TooltipContent>
        </Tooltip>
      )}
    </article>
  );
}
