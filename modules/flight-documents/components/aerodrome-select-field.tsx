"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useController, type Control, type FieldPath } from "react-hook-form";

import { DEFAULT_AERODROME_CODE } from "@/modules/flight-documents/constants/flight-plan-options";
import {
  PHILIPPINE_AERODROMES,
  getAerodromeName,
} from "@/modules/flight-documents/constants/philippine-aerodromes";
import type { FlightPlanFormValues } from "@/modules/flight-documents/schemas/flight-plan-schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

// Searchable Philippine ICAO aerodrome picker. ZZZZ is always offered
// for locations not in the list — the actual location then goes into
// Other Information (DEP/, DEST/, or ALTN/ line).
export function AerodromeSelectField({
  allowNone = false,
  control,
  error,
  helper,
  label,
  name,
  optional = false,
  required = false,
}: {
  allowNone?: boolean;
  control: Control<FlightPlanFormValues>;
  error?: string;
  helper?: string;
  label: string;
  name: FieldPath<FlightPlanFormValues>;
  optional?: boolean;
  required?: boolean;
}) {
  const { field } = useController({ control, name });
  const [open, setOpen] = useState(false);
  const value = typeof field.value === "string" ? field.value : "";
  const selectedName =
    value === DEFAULT_AERODROME_CODE
      ? "Not in the list"
      : getAerodromeName(value);

  function select(code: string) {
    field.onChange(code);
    setOpen(false);
  }

  return (
    <div className="grid content-start gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-secondary">*</span>}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-invalid={Boolean(error)}
          aria-required={required || undefined}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/95 px-3 text-sm sm:rounded-2xl md:h-10 disabled:cursor-default",
            error && "border-red-200/60",
          )}
          id={name}
          type="button"
        >
          {value ? (
            <span className="min-w-0 truncate text-left font-medium uppercase text-[#121212]">
              {value}
              {selectedName && (
                <span className="ml-1.5 font-normal normal-case text-muted-foreground">
                  — {selectedName}
                </span>
              )}
            </span>
          ) : optional ? (
            <span className="min-w-0 truncate text-left font-medium text-[#121212]">
              None
            </span>
          ) : (
            <span className="min-w-0 truncate text-left text-muted-foreground">
              Choose aerodrome
            </span>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
          sideOffset={6}
        >
          <Command>
            <CommandInput placeholder="Search code or airport..." />
            <CommandList>
              <CommandEmpty>No aerodrome found.</CommandEmpty>
              <CommandGroup>
                {allowNone && (
                  <CommandItem onSelect={() => select("")} value="none">
                    <span className="flex-1 text-muted-foreground">None</span>
                    {value === "" && <CheckIcon className="size-4 shrink-0" />}
                  </CommandItem>
                )}
                <CommandItem
                  onSelect={() => select(DEFAULT_AERODROME_CODE)}
                  value="ZZZZ not in the list other"
                >
                  <span className="flex-1 truncate">
                    <span className="font-semibold">ZZZZ</span> — Not in the
                    list
                  </span>
                  {value === DEFAULT_AERODROME_CODE && (
                    <CheckIcon className="size-4 shrink-0" />
                  )}
                </CommandItem>
                {PHILIPPINE_AERODROMES.map((aerodrome) => (
                  <CommandItem
                    key={aerodrome.code}
                    onSelect={() => select(aerodrome.code)}
                    value={`${aerodrome.code} ${aerodrome.name}`}
                  >
                    <span className="flex-1 truncate">
                      <span className="font-semibold">{aerodrome.code}</span> —{" "}
                      {aerodrome.name}
                    </span>
                    {value === aerodrome.code && (
                      <CheckIcon className="size-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
