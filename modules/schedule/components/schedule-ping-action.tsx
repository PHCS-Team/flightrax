"use client";

import { format } from "date-fns";
import { BellRingIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { usePingScheduleReady } from "@/modules/schedule/hooks/use-ping-schedule-ready.action";
import { useScheduleDay } from "@/modules/schedule/hooks/use-schedule-day.query";
import {
  formatDateLabel,
  isDateString,
  operationsToday,
} from "@/modules/schedule/utils/schedule-time";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Button } from "@/shared/components/ui/button";
import { CLOCK_TIME_PATTERN } from "@/shared/lib/clock-time";

export function SchedulePingAction() {
  const [date] = useQueryState(
    "date",
    parseAsString.withDefault(operationsToday()),
  );
  const activeDate = isDateString(date) ? date : operationsToday();
  const [open, setOpen] = useState(false);
  const day = useScheduleDay(activeDate);
  const ping = usePingScheduleReady({ onSent: () => setOpen(false) });
  const lastPing = day.data?.lastPing ?? null;
  const dateLabel = formatDateLabel(activeDate, "EEE, MMM d");

  return (
    <>
      <Button
        className="hidden h-10 cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default sm:inline-flex"
        disabled={day.isPending}
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <BellRingIcon className="size-4" />
        Ping everyone
      </Button>

      <FloatingActionButton
        className="sm:hidden"
        disabled={day.isPending}
        icon={BellRingIcon}
        label="Ping everyone"
        onClick={() => setOpen(true)}
      />

      <ConfirmationDialog
        confirmLabel="Send ping"
        confirmVariant="default"
        confirmingLabel="Sending..."
        description={`Everyone who can open the schedule gets a notification that the board for ${dateLabel} is ready.`}
        icon={BellRingIcon}
        isConfirming={ping.isExecuting}
        onConfirm={() => ping.execute({ date: activeDate })}
        onOpenChange={setOpen}
        open={open}
        title="Ping Everyone?"
        warning={
          lastPing
            ? `A ping for ${dateLabel} already went out at ${format(new Date(lastPing.sentAt), CLOCK_TIME_PATTERN)}${lastPing.sentByName ? ` by ${lastPing.sentByName}` : ""}. Sending again notifies everyone a second time.`
            : undefined
        }
      />
    </>
  );
}
