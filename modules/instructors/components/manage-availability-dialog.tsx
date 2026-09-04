"use client";

import { CalendarOffIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { useAddInstructorUnavailability } from "@/modules/instructors/hooks/use-add-instructor-unavailability.action";
import { useRemoveInstructorUnavailability } from "@/modules/instructors/hooks/use-remove-instructor-unavailability.action";
import type { ApprovedInstructor } from "@/modules/instructors/types/instructor";
import {
  formatUnavailabilityRange,
  getInstructorAvailabilityStatus,
  todayUtcDate,
} from "@/modules/instructors/utils/availability";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { DatePicker } from "@/shared/components/date-picker";

// Admin-only dialog: list, add, and remove an instructor's leave
// periods. Dates are zulu calendar dates; a single-day leave keeps the
// end date equal to the start date.
export function ManageAvailabilityDialog({
  instructor,
  onOpenChange,
  open,
}: {
  instructor: ApprovedInstructor;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const addUnavailability = useAddInstructorUnavailability({
    onAdded: () => {
      setStartsOn("");
      setEndsOn("");
    },
  });
  const removeUnavailability = useRemoveInstructorUnavailability();
  const status = getInstructorAvailabilityStatus(instructor.unavailabilities);
  const canSubmit =
    Boolean(startsOn) &&
    !addUnavailability.isExecuting &&
    (!endsOn || endsOn >= startsOn);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setStartsOn("");
      setEndsOn("");
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-6 sm:w-full sm:max-w-md">
        <DialogSectionHeader
          description={`Set the dates when this instructor is unavailable as Pilot in Command (PIC).`}
          icon={CalendarOffIcon}
          title="Manage Availability"
        />

        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Unavailability Periods
          </p>
          {instructor.unavailabilities.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
              No unavailability set — the instructor is available.
            </p>
          ) : (
            <div className="grid max-h-44 gap-1.5 overflow-y-auto pr-1">
              {instructor.unavailabilities.map((period) => {
                const isActive =
                  status.kind === "unavailable" &&
                  status.period.id === period.id;

                return (
                  <div
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    key={period.id}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatUnavailabilityRange(period)}
                      </p>
                      {isActive && (
                        <p className="text-xs font-medium text-destructive">
                          Currently unavailable
                        </p>
                      )}
                    </div>
                    <Button
                      aria-label="Remove unavailability period"
                      className="size-8 shrink-0 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-default"
                      disabled={removeUnavailability.isExecuting}
                      onClick={() =>
                        removeUnavailability.execute({
                          unavailabilityId: period.id,
                        })
                      }
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Add Period
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label
                className="text-sm font-semibold text-foreground/90"
                htmlFor="unavailability-starts-on"
              >
                Start Date
              </label>
              <DatePicker
                className="border-border bg-muted/30"
                id="unavailability-starts-on"
                min={todayUtcDate()}
                onChange={setStartsOn}
                placeholder="Select start date"
                value={startsOn}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                className="text-sm font-semibold text-foreground/90"
                htmlFor="unavailability-ends-on"
              >
                End Date
              </label>
              <DatePicker
                allowClear
                className="border-border bg-muted/30"
                id="unavailability-ends-on"
                min={startsOn || todayUtcDate()}
                onChange={setEndsOn}
                placeholder="Same day (optional)"
                value={endsOn}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave the end date empty for a single-day unavailability.
          </p>
        </div>

        <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
          <Button
            disabled={addUnavailability.isExecuting}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Close
          </Button>
          <Button
            className="disabled:cursor-default"
            disabled={!canSubmit}
            onClick={() =>
              addUnavailability.execute({
                instructorProfileId: instructor.id,
                startsOn,
                endsOn: endsOn || startsOn,
              })
            }
            type="button"
          >
            {addUnavailability.isExecuting ? "Adding..." : "Add period"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
