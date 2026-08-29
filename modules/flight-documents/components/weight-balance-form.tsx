"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PenLineIcon, RotateCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form";

import { FormRadioGroup } from "@/modules/flight-documents/components/form-radio-group";
import { BALANCE_STATUS_OPTIONS } from "@/modules/flight-documents/constants/flight-request-options";
import {
  weightBalanceFormSchema,
  type WeightBalanceFormValues,
} from "@/modules/flight-documents/schemas/weight-balance-schema";
import type { WeightBalanceGivens } from "@/modules/flight-documents/types/weight-balance";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

const INPUT_TEXT_CLASS = "text-[#121212]";

const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)] gap-2 sm:grid-cols-[minmax(8rem,1.2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)] sm:items-center";
const ROW_LABEL_SPAN_CLASS = "col-span-3 sm:col-span-1";
const CELL_LABEL_CLASS =
  "truncate whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

function toNumber(value: string) {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getWeightBalanceFormDefaults(
  givens: WeightBalanceGivens,
): WeightBalanceFormValues {
  return {
    usableFuelWeight: "",
    usableFuelMoment: "",
    fiAndStudentWeight: "",
    fiAndStudentMoment: "",
    baggageEntries: givens.baggageAreas.map((area) => ({
      position: area.position,
      weight: "0",
      moment: "0.00",
    })),
    balanceStatus: "balanced",
  };
}

export function WeightBalanceForm({
  cancelLabel = "Cancel",
  defaultValues,
  givens,
  isSubmitting,
  onCancel,
  onSubmit,
  readOnly = false,
  submitLabel,
}: {
  cancelLabel?: string;
  defaultValues?: WeightBalanceFormValues;
  givens: WeightBalanceGivens;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: WeightBalanceFormValues) => void;
  readOnly?: boolean;
  submitLabel: string;
}) {
  const form = useForm<WeightBalanceFormValues>({
    resolver: zodResolver(weightBalanceFormSchema),
    defaultValues: defaultValues ?? getWeightBalanceFormDefaults(givens),
  });
  const errors = form.formState.errors;
  const watched = useWatch({ control: form.control });

  const totalWeight =
    givens.basicEmptyWeight +
    toNumber(watched.usableFuelWeight ?? "") +
    toNumber(watched.fiAndStudentWeight ?? "") +
    (watched.baggageEntries ?? []).reduce(
      (sum, entry) => sum + toNumber(entry?.weight ?? ""),
      0,
    );
  const totalMoment =
    givens.basicEmptyWeightMoment +
    toNumber(watched.usableFuelMoment ?? "") +
    toNumber(watched.fiAndStudentMoment ?? "") +
    (watched.baggageEntries ?? []).reduce(
      (sum, entry) => sum + toNumber(entry?.moment ?? ""),
      0,
    );
  const totalCg = totalWeight > 0 ? totalMoment / totalWeight : 0;
  const isWithinLimits = totalWeight <= givens.maximumTakeoffWeight;

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset className="contents" disabled={readOnly}>
        <div className="space-y-3 sm:space-y-2">
          <div className={cn(ROW_GRID_CLASS, "hidden sm:grid")}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Load
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Weight (lbs)
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ARM (in)
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Moment (lbs-in)
            </p>
          </div>

          <div className={ROW_GRID_CLASS}>
            <div className={ROW_LABEL_SPAN_CLASS}>
              <RowLabel given label="Basic Empty Weight" />
            </div>
            <ValueCell mobileLabel="Weight (lbs)">
              <GivenCell value={givens.basicEmptyWeight} />
            </ValueCell>
            <ValueCell mobileLabel="ARM (in)">
              <GivenCell value={givens.basicEmptyWeightArm} />
            </ValueCell>
            <ValueCell mobileLabel="Moment (lbs-in)">
              <GivenCell value={givens.basicEmptyWeightMoment} />
            </ValueCell>
          </div>

          <EditableRow
            arm={givens.usableFuelArm}
            form={form}
            isSubmitting={isSubmitting}
            label="Usable Fuel"
            momentName="usableFuelMoment"
            weightName="usableFuelWeight"
          />
          <EditableRow
            arm={givens.fiAndStudentArm}
            form={form}
            isSubmitting={isSubmitting}
            label="FI + Student"
            momentName="fiAndStudentMoment"
            weightName="fiAndStudentWeight"
          />

          {givens.baggageAreas.map((area, index) => (
            <EditableRow
              arm={area.arm}
              form={form}
              isSubmitting={isSubmitting}
              key={area.position}
              label={`Baggage Area ${area.position}`}
              momentName={`baggageEntries.${index}.moment`}
              weightName={`baggageEntries.${index}.weight`}
            />
          ))}
          {givens.baggageAreas.length === 0 && (
            <p className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-muted-foreground">
              This aircraft type has no baggage areas.
            </p>
          )}

          <div className="h-px w-full bg-primary-foreground/20" />

          <div className={ROW_GRID_CLASS}>
            <div
              className={cn(
                ROW_LABEL_SPAN_CLASS,
                "flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1",
              )}
            >
              <p className="text-sm font-bold text-foreground">Total</p>
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  isWithinLimits
                    ? "border-success/40 bg-success/20 text-foreground"
                    : "border-destructive/50 bg-destructive/20 text-red-200",
                )}
              >
                {isWithinLimits ? "Within Limits" : "Overweight"}
              </span>
            </div>
            <ValueCell alwaysLabel mobileLabel="Weight (lbs)">
              <GivenCell emphasized value={Number(totalWeight.toFixed(2))} />
            </ValueCell>
            <ValueCell
              alwaysLabel
              mobileLabel={
                <>
                  <span className="sm:hidden">CG</span>
                  <span className="hidden sm:inline">CG (Moment / Weight)</span>
                </>
              }
            >
              <GivenCell emphasized value={Number(totalCg.toFixed(2))} />
            </ValueCell>
            <ValueCell alwaysLabel mobileLabel="Moment (lbs-in)">
              <GivenCell emphasized value={Number(totalMoment.toFixed(2))} />
            </ValueCell>
          </div>
        </div>

        <FormRadioGroup
          control={form.control}
          error={errors.balanceStatus?.message}
          label="Balance"
          name="balanceStatus"
          options={BALANCE_STATUS_OPTIONS}
        />

        <div className="grid gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Notes
          </p>
          <div className="grid gap-1 text-sm text-foreground sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">
                Maximum Takeoff Weight:
              </span>{" "}
              <span className="font-semibold">
                {givens.maximumTakeoffWeight.toLocaleString()} lbs
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">
                Baggage Area Max Weight:
              </span>{" "}
              <span className="font-semibold">
                {givens.baggageAreaMaxWeight.toLocaleString()} lbs
              </span>
            </p>
          </div>
        </div>

        {!readOnly && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <PenLineIcon className="mt-0.5 size-3.5 shrink-0" />
            Saving this Weight &amp; Balance automatically signs it with your
            registered signature from account settings.
          </p>
        )}
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          {cancelLabel}
        </Button>
        {!readOnly && (
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}

function RowLabel({
  given = false,
  label,
}: {
  given?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {given && (
        <span className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          Given
        </span>
      )}
    </div>
  );
}

function ValueCell({
  alwaysLabel = false,
  children,
  mobileLabel,
}: {
  alwaysLabel?: boolean;
  children: React.ReactNode;
  mobileLabel: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-1">
      <p className={cn(CELL_LABEL_CLASS, !alwaysLabel && "sm:hidden")}>
        {mobileLabel}
      </p>
      {children}
    </div>
  );
}

function GivenCell({
  emphasized = false,
  value,
}: {
  emphasized?: boolean;
  value: number;
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-3 text-sm text-foreground sm:rounded-2xl md:h-10",
        emphasized && "font-bold",
      )}
    >
      <span className="truncate">{value.toLocaleString()}</span>
    </div>
  );
}

function EditableRow({
  arm,
  form,
  isSubmitting,
  label,
  momentName,
  weightName,
}: {
  arm: number;
  form: UseFormReturn<WeightBalanceFormValues>;
  isSubmitting: boolean;
  label: string;
  momentName: FieldPath<WeightBalanceFormValues>;
  weightName: FieldPath<WeightBalanceFormValues>;
}) {
  const [momentLocked, setMomentLocked] = useState(false);
  const weight = useWatch({ control: form.control, name: weightName }) as
    | string
    | undefined;
  const weightError = form.getFieldState(weightName, form.formState).error
    ?.message;
  const momentError = form.getFieldState(momentName, form.formState).error
    ?.message;

  useEffect(() => {
    if (momentLocked || weight === undefined || weight.trim() === "") {
      return;
    }

    const parsed = Number(weight);

    if (!Number.isNaN(parsed) && parsed >= 0) {
      form.setValue(momentName, (parsed * arm).toFixed(2), {
        shouldValidate: true,
      });
    }
  }, [weight, arm, momentLocked, form, momentName]);

  function reenableAutoCalc() {
    setMomentLocked(false);
    const parsed = Number(form.getValues(weightName));

    if (!Number.isNaN(parsed) && parsed >= 0) {
      form.setValue(momentName, (parsed * arm).toFixed(2), {
        shouldValidate: true,
      });
    }
  }

  return (
    <div>
      <div className={ROW_GRID_CLASS}>
        <div className={ROW_LABEL_SPAN_CLASS}>
          <RowLabel label={label} />
        </div>
        <ValueCell mobileLabel="Weight (lbs)">
          <Input
            aria-invalid={Boolean(weightError)}
            aria-label={`${label} weight`}
            className={INPUT_TEXT_CLASS}
            disabled={isSubmitting}
            min={0}
            placeholder="0.00"
            step="any"
            type="number"
            {...form.register(weightName)}
          />
        </ValueCell>
        <ValueCell mobileLabel="ARM (in)">
          <GivenCell value={arm} />
        </ValueCell>
        <ValueCell mobileLabel="Moment (lbs-in)">
          <div className="flex items-center gap-1">
            <Input
              aria-invalid={Boolean(momentError)}
              aria-label={`${label} moment`}
              className={INPUT_TEXT_CLASS}
              disabled={isSubmitting}
              min={0}
              placeholder="0.00"
              step="any"
              type="number"
              {...form.register(momentName, {
                onChange: () => setMomentLocked(true),
              })}
            />
            {momentLocked && (
              <button
                aria-label={`Re-enable auto-calculate for ${label} moment`}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                onClick={reenableAutoCalc}
                type="button"
              >
                <RotateCwIcon className="size-3" />
              </button>
            )}
          </div>
        </ValueCell>
      </div>
      {(weightError || momentError) && (
        <p className="mt-1 text-sm text-destructive">
          {weightError ?? momentError}
        </p>
      )}
    </div>
  );
}
