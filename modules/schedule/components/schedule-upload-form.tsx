"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  SCHEDULE_FILE_ACCEPT,
  SCHEDULE_UPLOAD_LABEL_MAX,
} from "@/modules/schedule/constants/schedule-upload";
import { useUploadScheduleFile } from "@/modules/schedule/hooks/use-upload-schedule-file.action";
import {
  uploadScheduleFileSchema,
  type ScheduleUploadFormValues,
} from "@/modules/schedule/schemas/schedule-upload-schema";
import { formatFileSize } from "@/modules/schedule/utils/schedule-upload-format";
import { operationsToday } from "@/modules/schedule/utils/schedule-time";
import { DatePicker } from "@/shared/components/date-picker";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export function ScheduleUploadForm({
  onCancel,
  onUploaded,
}: {
  onCancel: () => void;
  onUploaded: () => void;
}) {
  const today = operationsToday();
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<ScheduleUploadFormValues>({
    resolver: zodResolver(uploadScheduleFileSchema),
    defaultValues: {
      file: undefined as unknown as File,
      label: "",
      startsOn: today,
      endsOn: today,
    },
  });
  const upload = useUploadScheduleFile({ onUploaded });
  const errors = form.formState.errors;
  const values = useWatch({ control: form.control });
  const setOptions = { shouldDirty: true, shouldValidate: true } as const;
  const fieldId = (name: string) => `schedule-upload-${name}`;
  const file = values.file instanceof File ? values.file : null;

  function handleStartsOnChange(value: string) {
    form.setValue("startsOn", value, setOptions);

    if (values.endsOn && value > values.endsOn) {
      form.setValue("endsOn", value, setOptions);
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit((submitted) => upload.execute(submitted))}
    >
      <div className="grid gap-1.5">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor={fieldId("file")}
        >
          Excel File
        </label>
        <input
          accept={SCHEDULE_FILE_ACCEPT}
          className="sr-only"
          id={fieldId("file")}
          onChange={(event) => {
            const picked = event.target.files?.[0];

            if (picked) {
              form.setValue("file", picked, setOptions);
            }
          }}
          ref={inputRef}
          type="file"
        />
        <button
          className={cn(
            "group grid min-h-16 w-full min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-background p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default sm:flex sm:rounded-2xl",
            errors.file && "border-destructive",
          )}
          disabled={upload.isExecuting}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:rounded-xl">
            <FileSpreadsheetIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {file ? file.name : "Choose a workbook"}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {file
                ? `${formatFileSize(file.size)} selected`
                : "Excel .xlsx, up to 4 MB"}
            </span>
          </span>
          <span className="col-span-2 w-full shrink-0 rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold text-foreground transition group-hover:border-primary/40 sm:col-span-1 sm:w-auto sm:rounded-xl">
            Browse
          </span>
        </button>
        {errors.file && (
          <p className="text-xs text-destructive">{errors.file.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("starts-on")}
          >
            Covers From
          </label>
          <DatePicker
            aria-invalid={Boolean(errors.startsOn)}
            disabled={upload.isExecuting}
            id={fieldId("starts-on")}
            onChange={handleStartsOnChange}
            placeholder="First day"
            value={values.startsOn}
          />
          {errors.startsOn && (
            <p className="text-xs text-destructive">{errors.startsOn.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("ends-on")}
          >
            Covers To
          </label>
          <DatePicker
            aria-invalid={Boolean(errors.endsOn)}
            disabled={upload.isExecuting}
            id={fieldId("ends-on")}
            min={values.startsOn}
            onChange={(value) => form.setValue("endsOn", value, setOptions)}
            placeholder="Last day"
            value={values.endsOn}
          />
          {errors.endsOn && (
            <p className="text-xs text-destructive">{errors.endsOn.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-1.5">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor={fieldId("label")}
        >
          Label
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <Input
          aria-invalid={Boolean(errors.label)}
          disabled={upload.isExecuting}
          id={fieldId("label")}
          maxLength={SCHEDULE_UPLOAD_LABEL_MAX}
          placeholder="Week 38, Rev 2..."
          {...form.register("label")}
        />
        {errors.label ? (
          <p className="text-xs text-destructive">{errors.label.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Shown on the calendar instead of the file name.
          </p>
        )}
      </div>

      <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
        <Button
          disabled={upload.isExecuting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={upload.isExecuting} type="submit">
          <UploadIcon className="size-4" />
          {upload.isExecuting ? "Uploading..." : "Upload file"}
        </Button>
      </DialogFooter>
    </form>
  );
}
