"use client";

import { UploadIcon } from "lucide-react";
import { useState } from "react";

import { ScheduleUploadDialog } from "@/modules/schedule/components/schedule-upload-dialog";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Button } from "@/shared/components/ui/button";

export function ScheduleUploadAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="hidden h-10 cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:inline-flex"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <UploadIcon className="size-4" />
        Upload file
      </Button>

      <FloatingActionButton
        className="sm:hidden"
        icon={UploadIcon}
        label="Upload file"
        onClick={() => setOpen(true)}
      />

      <ScheduleUploadDialog onOpenChange={setOpen} open={open} />
    </>
  );
}
