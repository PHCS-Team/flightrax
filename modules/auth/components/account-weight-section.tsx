"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WeightIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useUpdateWeight } from "@/modules/auth/hooks/use-update-weight.action";
import {
  updateWeightSchema,
  type UpdateWeightInput,
} from "@/modules/auth/schemas/weight-schema";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { formatWeight, kgToLbs, lbsToKg } from "@/shared/lib/weight";

export function AccountWeightSection({
  weightLbs,
}: {
  weightLbs: number | null;
}) {
  const [open, setOpen] = useState(false);
  const { executeAsync, isExecuting } = useUpdateWeight();
  const hasWeight = weightLbs !== null;

  return (
    <GlassSurface className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
          <WeightIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
            Body Weight
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/70">
            {hasWeight
              ? "Recorded for weight and balance awareness. Saved in pounds."
              : "Not set yet. Add it so the school knows your weight for loading."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-3">
        {hasWeight ? (
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-tight text-primary-foreground">
              {formatWeight(weightLbs)}{" "}
              <span className="text-base font-medium text-primary-foreground/70">
                lbs
              </span>
            </p>
            <p className="text-xs text-primary-foreground/60">
              About {formatWeight(lbsToKg(weightLbs))} kg
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-primary-foreground/60">
            Weight not set
          </p>
        )}
        <Button
          className="shrink-0 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          onClick={() => setOpen(true)}
          type="button"
          variant="outline"
        >
          {hasWeight ? "Edit weight" : "Set weight"}
        </Button>
      </div>

      {open && (
        <WeightFormDialog
          executeAsync={executeAsync}
          isExecuting={isExecuting}
          onOpenChange={setOpen}
          weightLbs={weightLbs}
        />
      )}
    </GlassSurface>
  );
}

function WeightFormDialog({
  executeAsync,
  isExecuting,
  onOpenChange,
  weightLbs,
}: {
  executeAsync: ReturnType<typeof useUpdateWeight>["executeAsync"];
  isExecuting: boolean;
  onOpenChange: (open: boolean) => void;
  weightLbs: number | null;
}) {
  const hasWeight = weightLbs !== null;
  const form = useForm<UpdateWeightInput>({
    resolver: zodResolver(updateWeightSchema),
    defaultValues: {
      weight: hasWeight ? formatWeight(lbsToKg(weightLbs)) : "",
      unit: "kg",
    },
  });
  const unit = useWatch({ control: form.control, name: "unit" });

  function switchUnit(nextUnit: UpdateWeightInput["unit"]) {
    if (nextUnit === unit) {
      return;
    }

    const current = Number(form.getValues("weight"));

    if (form.getValues("weight").trim() !== "" && Number.isFinite(current)) {
      form.setValue(
        "weight",
        formatWeight(nextUnit === "kg" ? lbsToKg(current) : kgToLbs(current)),
        { shouldValidate: form.formState.isSubmitted },
      );
    }

    form.setValue("unit", nextUnit);
  }

  async function handleSubmit(values: UpdateWeightInput) {
    const result = await executeAsync(values);

    if (result?.data?.ok) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogSectionHeader
          description="Enter your weight in pounds or kilograms — it is always stored in pounds."
          icon={WeightIcon}
          title={hasWeight ? "Edit Body Weight" : "Set Body Weight"}
        />
        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid content-start gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="account-weight-value"
              >
                Weight
              </label>
              <Input
                autoFocus
                id="account-weight-value"
                inputMode="decimal"
                placeholder="e.g. 70"
                {...form.register("weight")}
              />
            </div>
            <div className="grid content-start gap-2">
              <p className="text-sm font-semibold text-foreground">Unit</p>
              <div
                aria-label="Weight unit"
                className="grid h-9 grid-cols-2 gap-1 rounded-lg border border-input bg-muted/40 p-1 md:h-10"
                role="group"
              >
                <button
                  aria-pressed={unit === "kg"}
                  className={cn(
                    "cursor-pointer touch-manipulation rounded-md px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    unit === "kg"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => switchUnit("kg")}
                  type="button"
                >
                  kg
                </button>
                <button
                  aria-pressed={unit === "lbs"}
                  className={cn(
                    "cursor-pointer touch-manipulation rounded-md px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    unit === "lbs"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => switchUnit("lbs")}
                  type="button"
                >
                  lbs
                </button>
              </div>
            </div>
          </div>
          {form.formState.errors.weight && (
            <p className="text-sm text-destructive">
              {form.formState.errors.weight.message}
            </p>
          )}
          <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
            <Button
              disabled={isExecuting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isExecuting} type="submit">
              {isExecuting ? "Saving..." : "Save weight"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
