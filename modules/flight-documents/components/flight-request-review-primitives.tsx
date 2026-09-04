"use client";

import { CheckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function optionLabel(
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ReviewCardHeading({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-primary-foreground/15 pb-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold text-primary-foreground">{title}</h2>
        <p className="text-xs text-primary-foreground/60">{description}</p>
      </div>
    </div>
  );
}

export function ReviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="grid gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ReviewField({
  className,
  label,
  multiline = false,
  value,
}: {
  className?: string;
  label: string;
  multiline?: boolean;
  value: string | null;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div
        className={cn(
          "min-w-0 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-3 text-sm uppercase wrap-break-word text-primary-foreground sm:rounded-2xl",
          multiline
            ? "whitespace-pre-wrap py-2"
            : "flex min-h-9 items-center md:min-h-10",
        )}
      >
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

export function ReviewOptionsField({
  className,
  label,
  options,
  value,
}: {
  className?: string;
  label: string;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  value: string;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <div
              className={cn(
                "flex items-start gap-2 text-sm",
                selected
                  ? "font-medium text-primary-foreground"
                  : "text-primary-foreground/50",
              )}
              key={option.value}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary-foreground bg-primary-foreground"
                    : "border-primary-foreground/40",
                )}
              >
                {selected && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </span>
              <span>{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewChecklistField({
  className,
  items,
  label,
}: {
  className?: string;
  items: { checked: boolean; label: string }[];
  label: string;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            className={cn(
              "flex items-start gap-2 text-sm",
              item.checked
                ? "font-medium text-primary-foreground"
                : "text-primary-foreground/50",
            )}
            key={item.label}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-lg border",
                item.checked
                  ? "border-primary-foreground bg-primary-foreground"
                  : "border-primary-foreground/40",
              )}
            >
              {item.checked && <CheckIcon className="size-3 text-primary" />}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
