"use client";

import { DownloadIcon } from "lucide-react";

import { useScheduleUpload } from "@/modules/schedule/hooks/use-schedule-upload.query";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function ScheduleUploadDownloadAction({
  uploadId,
}: {
  uploadId: string;
}) {
  const upload = useScheduleUpload(uploadId);
  const href = upload.data?.downloadUrl;

  if (!href) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            className="h-9 cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:h-10"
            variant="outline"
          >
            <a download={upload.data?.fileName} href={href}>
              <DownloadIcon className="size-4" />
              <span className="hidden sm:inline">Download Excel</span>
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download Excel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
