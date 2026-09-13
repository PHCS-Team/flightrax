"use client";

import { PaletteIcon } from "lucide-react";

import {
  SCHEDULE_SESSION_TYPE_META,
  SCHEDULE_SESSION_TYPES,
} from "@/modules/schedule/constants/session-types";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

export function ScheduleLegendDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogSectionHeader
          description="What each colour on the board means."
          icon={PaletteIcon}
          title="Board Legend"
        />
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {SCHEDULE_SESSION_TYPES.map((type) => {
            const meta = SCHEDULE_SESSION_TYPE_META[type];

            return (
              <li className="flex items-center gap-3" key={type}>
                <span
                  className={cn(
                    "flex h-7 w-14 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ring-1 ring-black/5",
                    meta.className,
                  )}
                >
                  {meta.code}
                </span>
                <span className="text-sm text-foreground">{meta.label}</span>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
