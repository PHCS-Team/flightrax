"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCwIcon, ScaleIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { AircraftWeightBalance } from "@/modules/aircrafts/types/aircraft-weight-balance";
import { useSetAircraftWeightBalance } from "@/modules/aircrafts/hooks/use-set-aircraft-weight-balance.action";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

const weightBalanceFormSchema = z.object({
  basicEmptyWeight: z
    .string()
    .min(1, "Enter basic empty weight.")
    .regex(/^\d+(\.\d+)?$/, "Enter a valid number."),
  arm: z
    .string()
    .min(1, "Enter arm.")
    .regex(/^\d+(\.\d+)?$/, "Enter a valid number."),
  moment: z
    .string()
    .min(1, "Enter moment.")
    .regex(/^\d+(\.\d+)?$/, "Enter a valid number."),
});

export function AircraftWeightBalanceDialog({
  aircraftId,
  aircraftLabel,
  initialValues,
  onOpenChange,
  open,
  trigger,
}: {
  aircraftId: string;
  aircraftLabel: string;
  initialValues?: AircraftWeightBalance;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger?: ReactNode;
}) {
  const setWeightBalance = useSetAircraftWeightBalance({
    onSaved: () => onOpenChange(false),
  });
  const form = useForm({
    resolver: zodResolver(weightBalanceFormSchema),
    defaultValues: {
      basicEmptyWeight: initialValues
        ? String(initialValues.basicEmptyWeight)
        : "",
      arm: initialValues ? String(initialValues.arm) : "",
      moment: initialValues ? String(initialValues.moment) : "",
    },
  });
  const errors = form.formState.errors;
  const isExecuting = setWeightBalance.isExecuting;
  const [momentLocked, setMomentLocked] = useState(false);
  const watchedWeight = useWatch({ control: form.control, name: "basicEmptyWeight" });
  const watchedArm = useWatch({ control: form.control, name: "arm" });

  useEffect(() => {
    if (momentLocked) return;

    const weight = Number(watchedWeight);
    const arm = Number(watchedArm);

    if (!isNaN(weight) && !isNaN(arm) && weight > 0 && arm > 0) {
      form.setValue("moment", (weight * arm).toFixed(2), {
        shouldValidate: true,
      });
    }
  }, [watchedWeight, watchedArm, momentLocked, form]);

  function reenableMomentAutoCalc() {
    setMomentLocked(false);
    const weight = Number(form.getValues("basicEmptyWeight"));
    const arm = Number(form.getValues("arm"));

    if (!isNaN(weight) && !isNaN(arm) && weight > 0 && arm > 0) {
      form.setValue("moment", (weight * arm).toFixed(2), {
        shouldValidate: true,
      });
    }
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => setMomentLocked(false), 0);
      form.reset({
        basicEmptyWeight: initialValues
          ? String(initialValues.basicEmptyWeight)
          : "",
        arm: initialValues ? String(initialValues.arm) : "",
        moment: initialValues ? String(initialValues.moment) : "",
      });
    }
  }, [open, form, initialValues]);

  function handleSubmit(values: {
    basicEmptyWeight: string;
    arm: string;
    moment: string;
  }) {
    setWeightBalance.execute({
      aircraftId,
      basicEmptyWeight: Number(values.basicEmptyWeight),
      arm: Number(values.arm),
      moment: Number(values.moment),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-md">
        <DialogSectionHeader
          description={`Set weight and balance configuration for ${aircraftLabel}.`}
          icon={ScaleIcon}
          title="Weight & balance"
        />

        <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <WbField
                error={errors.basicEmptyWeight?.message}
                hint="lbs"
                id="basic-empty-weight"
                label="Basic empty weight"
                register={form.register("basicEmptyWeight")}
              />
              <WbField
                error={errors.arm?.message}
                hint="in"
                id="arm"
                label="Arm"
                register={form.register("arm")}
              />
            </div>
            <WbField
              error={errors.moment?.message}
              hint="lbs-in"
              id="moment"
              label="Moment"
              labelAction={
                momentLocked ? (
                  <button
                    className="-mr-0.5 inline-flex cursor-pointer items-center justify-center rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={reenableMomentAutoCalc}
                    title="Re-enable auto-calculate"
                    type="button"
                  >
                    <RotateCwIcon className="size-3" />
                  </button>
                ) : undefined
              }
              register={form.register("moment", {
                onChange: () => {
                  setMomentLocked(true);
                },
              })}
            />
          </div>

          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground/80">Moment</span>{" "}
              auto-calculates as{" "}
              <span className="font-medium text-foreground/80">
                Basic Empty Weight &times; Arm
              </span>
              . Typing in Moment manually stops auto-calculation &mdash; click
              the <RotateCwIcon className="inline size-2.5 align-middle" /> icon
              to re-enable.
            </p>
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
            <Button
              disabled={isExecuting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isExecuting} type="submit">
              {isExecuting ? "Saving..." : "Save configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WbField({
  error,
  hint,
  id,
  label,
  labelAction,
  register,
}: {
  error?: string;
  hint: string;
  id: string;
  label: string;
  labelAction?: ReactNode;
  register: ReturnType<ReturnType<typeof useForm>["register"]>;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground" htmlFor={id}>
          {label}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            ({hint})
          </span>
          <span className="ml-1 text-secondary">*</span>
        </label>
        {labelAction}
      </div>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        aria-required="true"
        id={id}
        min={0}
        placeholder="0.00"
        step="any"
        type="number"
        {...register}
      />
      {error && (
        <p className="text-sm text-destructive" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
