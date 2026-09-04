"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { MegaphoneIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useCreateNotam } from "@/modules/notams/hooks/use-create-notam.action";
import {
  createNotamSchema,
  type CreateNotamInput,
} from "@/modules/notams/schemas/notam-schema";

import { todayDate } from "@/modules/notams/utils/notam-dates";
import {
  NOTAM_SEVERITIES,
  NOTAM_SEVERITY_META,
} from "@/shared/lib/aviation/notam-options";
import type { NotamSeverity } from "@/shared/types/notam";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
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
import { Textarea } from "@/shared/components/ui/textarea";

function getDefaultValues(): CreateNotamInput {
  return {
    title: "",
    description: "",
    severity: "advisory",
    expiresOn: todayDate(),
  };
}

export function NotamForm({
  onCancel,
  onPosted,
}: {
  onCancel: () => void;
  onPosted?: () => void;
}) {
  const [pendingValues, setPendingValues] = useState<CreateNotamInput | null>(
    null,
  );
  const form = useForm<CreateNotamInput>({
    resolver: zodResolver(createNotamSchema),
    defaultValues: getDefaultValues(),
  });
  const createNotam = useCreateNotam({
    onSaved: () => {
      form.reset(getDefaultValues());
      setPendingValues(null);
      onPosted?.();
    },
  });
  const errors = form.formState.errors;
  const severity = useWatch({ control: form.control, name: "severity" });
  const fieldId = (name: string) => `notam-${name}`;

  return (
    <>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => setPendingValues(values))}
      >
        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("title")}
          >
            Title
          </label>
          <Input
            aria-invalid={Boolean(errors.title)}
            id={fieldId("title")}
            placeholder="Runway 03/21 closed for repainting"
            {...form.register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor={fieldId("description")}
          >
            Description
          </label>
          <Textarea
            aria-invalid={Boolean(errors.description)}
            className="min-h-20 border-border bg-muted/30"
            id={fieldId("description")}
            placeholder="What pilots need to know, when it applies, and who to coordinate with"
            {...form.register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={fieldId("severity")}
            >
              Severity
            </label>
            <Select
              onValueChange={(value) =>
                form.setValue("severity", value as NotamSeverity, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              value={severity}
            >
              <SelectTrigger id={fieldId("severity")}>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {NOTAM_SEVERITIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {NOTAM_SEVERITY_META[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={fieldId("expires-on")}
            >
              Expires On
            </label>
            <Input
              aria-invalid={Boolean(errors.expiresOn)}
              id={fieldId("expires-on")}
              min={todayDate()}
              type="date"
              {...form.register("expiresOn")}
            />
            {errors.expiresOn && (
              <p className="text-xs text-destructive">
                {errors.expiresOn.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Today posts a single-day notice. Pick a later date to keep it up for
          several days.
        </p>

        <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
          <Button
            disabled={createNotam.isExecuting}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={createNotam.isExecuting} type="submit">
            <SendIcon className="size-4" />
            Post NOTAM
          </Button>
        </DialogFooter>
      </form>

      <ConfirmationDialog
        confirmLabel="Post NOTAM"
        confirmVariant="default"
        confirmingLabel="Posting..."
        description={
          pendingValues
            ? `This goes out as a ${NOTAM_SEVERITY_META[pendingValues.severity].label.toLowerCase()} notice and stays up until ${format(new Date(`${pendingValues.expiresOn}T00:00:00`), "MMM d, yyyy")}.`
            : "Post this notice."
        }
        icon={MegaphoneIcon}
        isConfirming={createNotam.isExecuting}
        onConfirm={() => {
          if (pendingValues) {
            createNotam.execute(pendingValues);
          }
        }}
        onOpenChange={(open) => {
          if (!open) setPendingValues(null);
        }}
        open={Boolean(pendingValues)}
        title="Post This NOTAM?"
        warning="Posted NOTAMs appear on every pilot's and instructor's dashboard right away and cannot be edited, only deleted. This post is recorded under your name. Make sure the announcement is accurate before you continue."
      />
    </>
  );
}
