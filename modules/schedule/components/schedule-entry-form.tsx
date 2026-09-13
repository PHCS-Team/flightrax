"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon, Trash2Icon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { SchedulePersonField } from "@/modules/schedule/components/schedule-person-field";
import {
  SCHEDULE_END_TIME_OPTIONS,
  SCHEDULE_START_TIME_OPTIONS,
} from "@/modules/schedule/constants/schedule-options";
import {
  SCHEDULE_SESSION_TYPE_META,
  SCHEDULE_SESSION_TYPES,
  type ScheduleSessionType,
} from "@/modules/schedule/constants/session-types";
import { useCreateScheduleEntry } from "@/modules/schedule/hooks/use-create-schedule-entry.action";
import { useSchedulePeople } from "@/modules/schedule/hooks/use-schedule-people.query";
import { useUpdateScheduleEntry } from "@/modules/schedule/hooks/use-update-schedule-entry.action";
import {
  scheduleEntryFormSchema,
  type ScheduleEntryFormValues,
} from "@/modules/schedule/schemas/schedule-schema";
import type {
  ScheduleAircraft,
  ScheduleEntry,
} from "@/modules/schedule/types/schedule";
import {
  formatDateLabel,
  formatTimeLabel,
  timeOnDate,
} from "@/modules/schedule/utils/schedule-time";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

function getDefaultValues(
  entry: ScheduleEntry | null,
  date: string,
): ScheduleEntryFormValues {
  if (!entry) {
    return {
      startTime: "06:00",
      endTime: "07:00",
      sessionType: "lcl",
      pilotProfileId: "",
      instructorProfileId: "",
      label: "",
    };
  }

  return {
    startTime: timeOnDate(entry.startsAt, date),
    endTime: timeOnDate(entry.endsAt, date),
    sessionType: entry.sessionType,
    pilotProfileId: entry.pilot?.id ?? "",
    instructorProfileId: entry.instructor?.id ?? "",
    label: entry.label ?? "",
  };
}

export function ScheduleEntryForm({
  aircraft,
  date,
  entry,
  onCancel,
  onDelete,
  onSaved,
}: {
  aircraft: ScheduleAircraft;
  date: string;
  entry: ScheduleEntry | null;
  onCancel: () => void;
  onDelete?: (entry: ScheduleEntry) => void;
  onSaved: () => void;
}) {
  const form = useForm<ScheduleEntryFormValues>({
    resolver: zodResolver(scheduleEntryFormSchema),
    defaultValues: getDefaultValues(entry, date),
  });
  const people = useSchedulePeople();
  const createEntry = useCreateScheduleEntry({ onSaved });
  const updateEntry = useUpdateScheduleEntry({ onSaved });
  const isSubmitting = createEntry.isExecuting || updateEntry.isExecuting;
  const errors = form.formState.errors;
  const values = useWatch({ control: form.control });
  const setOptions = { shouldDirty: true, shouldValidate: true } as const;
  const fieldId = (name: string) => `schedule-entry-${name}`;
  const needsPeople = values.sessionType
    ? SCHEDULE_SESSION_TYPE_META[values.sessionType].needsPeople
    : true;

  function handleSessionTypeChange(value: string) {
    const nextType = value as ScheduleSessionType;

    form.setValue("sessionType", nextType, setOptions);

    if (SCHEDULE_SESSION_TYPE_META[nextType].needsPeople) {
      form.setValue("label", "", { shouldDirty: true });
    } else {
      form.setValue("pilotProfileId", "", { shouldDirty: true });
      form.setValue("instructorProfileId", "", { shouldDirty: true });
    }

    form.clearErrors(["pilotProfileId", "instructorProfileId", "label"]);
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit((submitted) => {
        if (entry) {
          updateEntry.execute({ ...submitted, id: entry.id, date });
        } else {
          createEntry.execute({ ...submitted, aircraftId: aircraft.id, date });
        }
      })}
    >
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:rounded-2xl">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">
            {aircraft.registrationMark}
            <span className="ml-1.5 text-xs font-semibold uppercase text-muted-foreground">
              {aircraft.typeDesignator}
            </span>
          </p>
        </div>
        <p className="shrink-0 text-xs font-medium text-muted-foreground">
          {formatDateLabel(date, "EEE, MMM d")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("start")}
          >
            Start
          </label>
          <Select
            disabled={isSubmitting}
            onValueChange={(value) =>
              form.setValue("startTime", value, setOptions)
            }
            value={values.startTime}
          >
            <SelectTrigger
              aria-invalid={Boolean(errors.startTime)}
              id={fieldId("start")}
            >
              <SelectValue placeholder="Start" />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_START_TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {formatTimeLabel(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.startTime && (
            <p className="text-xs text-destructive">
              {errors.startTime.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("end")}
          >
            End
          </label>
          <Select
            disabled={isSubmitting}
            onValueChange={(value) => form.setValue("endTime", value, setOptions)}
            value={values.endTime}
          >
            <SelectTrigger
              aria-invalid={Boolean(errors.endTime)}
              id={fieldId("end")}
            >
              <SelectValue placeholder="End" />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_END_TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {formatTimeLabel(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.endTime && (
            <p className="text-xs text-destructive">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-1.5">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor={fieldId("session-type")}
        >
          Session Type
        </label>
        <Select
          disabled={isSubmitting}
          onValueChange={handleSessionTypeChange}
          value={values.sessionType}
        >
          <SelectTrigger
            aria-invalid={Boolean(errors.sessionType)}
            id={fieldId("session-type")}
          >
            <SelectValue placeholder="Pick a session type" />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_SESSION_TYPES.map((type) => {
              const meta = SCHEDULE_SESSION_TYPE_META[type];

              return (
                <SelectItem key={type} value={type}>
                  <span
                    className={cn(
                      "size-3 rounded-sm ring-1 ring-black/10",
                      meta.className,
                    )}
                  />
                  <span className="font-semibold">{meta.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {meta.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {needsPeople ? (
        <div className="grid gap-3">
          <SchedulePersonField
            disabled={isSubmitting}
            id={fieldId("pilot")}
            isLoading={people.isPending}
            label="Pilot"
            onChange={(value) =>
              form.setValue("pilotProfileId", value, setOptions)
            }
            people={people.data ?? []}
            value={values.pilotProfileId ?? ""}
          />
          <SchedulePersonField
            disabled={isSubmitting}
            id={fieldId("instructor")}
            isLoading={people.isPending}
            label="Instructor"
            onChange={(value) =>
              form.setValue("instructorProfileId", value, setOptions)
            }
            people={people.data ?? []}
            value={values.instructorProfileId ?? ""}
          />
          {errors.pilotProfileId ? (
            <p className="text-xs text-destructive">
              {errors.pilotProfileId.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              At least one of the two. A solo has only a pilot; a check has
              only an instructor.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("label")}
          >
            Note
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Input
            aria-invalid={Boolean(errors.label)}
            disabled={isSubmitting}
            id={fieldId("label")}
            placeholder="Waiting for parts, test flight..."
            {...form.register("label")}
          />
          {errors.label && (
            <p className="text-xs text-destructive">{errors.label.message}</p>
          )}
        </div>
      )}

      {entry && onDelete && (
        <Button
          className="w-full sm:w-fit"
          disabled={isSubmitting}
          onClick={() => onDelete(entry)}
          type="button"
          variant="destructive"
        >
          <Trash2Icon className="size-4" />
          Delete entry
        </Button>
      )}

      <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <SaveIcon className="size-4" />
          {entry ? "Save changes" : "Post entry"}
        </Button>
      </DialogFooter>
    </form>
  );
}
