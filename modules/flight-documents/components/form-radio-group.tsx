"use client";

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/shared/components/ui/checkbox";

// Radio-style option list (round indicators, exactly one active) bound to
// a react-hook-form string field. Shared by the flight plan and weight &
// balance forms.
export function FormRadioGroup<T extends FieldValues>({
  control,
  error,
  label,
  name,
  options,
}: {
  control: Control<T>;
  error?: string;
  label: string;
  name: FieldPath<T>;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}) {
  const { field } = useController({ control, name });

  return (
    <div className="grid content-start gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-1">
        {options.map((option) => (
          <label
            className="flex cursor-pointer items-start gap-2.5 py-1 text-sm text-foreground sm:py-0.5"
            key={option.value}
          >
            <Checkbox
              checked={field.value === option.value}
              className="mt-0.5 cursor-pointer rounded-full sm:size-5"
              onCheckedChange={() => field.onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
